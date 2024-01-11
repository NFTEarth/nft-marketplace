import { AddressZero } from "@ethersproject/constants";
import { parseUnits } from "@ethersproject/units";
import {
  arbitrum,
  mainnet,
  polygon,
  optimism,
  fantom,
  avalanche,
  zkSync,
  canto,
  Chain,
  bsc,
  polygonZkEvm
} from 'wagmi/chains'
import {BigNumber} from "@ethersproject/bignumber";
import db from "lib/db";

import {OFT_CHAINS, base} from "./chains";

const currencyPrice = db.collection('currency_price')
import { getCurrency } from "./currency";

const USD_DECIMALS = 6;
// TODO: This should be a per-network setting
const NATIVE_UNIT = BigNumber.from("1000000000000000000");

export type Price = {
  currency: string;
  timestamp: number;
  value: string;
};

const Weth: Record<number, string> = {
  [mainnet.id]: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  [optimism.id]: "0x4200000000000000000000000000000000000006",
  [arbitrum.id]: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
  [polygonZkEvm.id]: "0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9",
  [base.id] :"0x4200000000000000000000000000000000000006",
  // Polygon: Wrapped MATIC
  [polygon.id]: "0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270",
  // Avalanche: Wrapped AVAX
  [avalanche.id]: "0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
};

const getCachedUSDPrice = async (
  currencyAddress: string,
  chainId: number,
  timestamp: number
): Promise<Price | undefined> =>
  currencyPrice
    .findOne(
      {
        currency: currencyAddress,
        timestamp,
        chainId,
      }
    )
    .then((data: any) =>
      data
        ? {
            currency: currencyAddress,
            timestamp: data.timestamp,
            value: data.value,
          }
        : undefined
    )
    .catch(() => undefined);

const getUpstreamUSDPrice = async (
  currencyAddress: string,
  chainId: number,
  timestamp: number
): Promise<Price | undefined> => {
  try {
    const date = new Date(timestamp * 1000);
    const truncatedTimestamp = Math.floor(date.valueOf() / 1000);
    const currency = await getCurrency(currencyAddress, chainId);
    const coingeckoCurrencyId = currency?.metadata?.coingeckoCurrencyId;

    if (coingeckoCurrencyId) {
      const url = `https://api.coingecko.com/api/v3/coins/${coingeckoCurrencyId}`;
      console.info("prices", `Fetching price from Coingecko: ${url}`);

      const result: {
        market_data: {
          current_price: { [symbol: string]: number };
        };
      } = await fetch(url)
        .then(response => response.json())

      const usdPrice = result?.market_data?.current_price?.["usd"];
      if (usdPrice) {
        const value = parseUnits(usdPrice.toFixed(USD_DECIMALS), USD_DECIMALS).toString();

        await currencyPrice.insertOne(
          {
            currency: currencyAddress,
            timestamp: truncatedTimestamp,
            value,
          }
        );

        return {
          currency: currencyAddress,
          timestamp: truncatedTimestamp,
          value,
        };
      }
    }
  } catch (error) {
    console.error(
      "prices",
      `Failed to fetch upstream USD price for ${currencyAddress} and timestamp ${timestamp}: ${error}`
    );
  }

  return undefined;
};

const USD_PRICE_MEMORY_CACHE = new Map<string, Price>();
const getAvailableUSDPrice = async (
  currencyAddress: string,
  chainId: number,
  timestamp: number,
  acceptStalePrice?: boolean
) => {
  // At the moment, we support day-level granularity for prices
  const DAY = 24 * 3600;

  const normalizedTimestamp = Math.floor(timestamp / DAY);
  const key = `${currencyAddress}-${normalizedTimestamp}:${chainId}`.toLowerCase();
  if (!USD_PRICE_MEMORY_CACHE.has(key)) {
    // If the price is not available in the memory cache, use any available database cached price
    let cachedPrice = await getCachedUSDPrice(currencyAddress, chainId, timestamp);

    // Fetch the latest price from upstream if:
    // - we have no price available
    // - we have a stale price available and stale prices are not accepted
    let fetchFromUpstream = false;
    if (cachedPrice) {
      const isStale = Math.floor(cachedPrice.timestamp / DAY) !== normalizedTimestamp;
      if (isStale && !acceptStalePrice) {
        fetchFromUpstream = true;
      }
    } else {
      fetchFromUpstream = true;
    }

    if (fetchFromUpstream) {
      const upstreamPrice = await getUpstreamUSDPrice(currencyAddress, chainId, timestamp);
      if (upstreamPrice) {
        cachedPrice = upstreamPrice;
      }
    }

    if (cachedPrice) {
      USD_PRICE_MEMORY_CACHE.set(key, cachedPrice);
    }
  }

  return USD_PRICE_MEMORY_CACHE.get(key);
};

export type USDAndNativePrices = {
  usdPrice?: string;
  nativePrice?: string;
};

/**
 * Will return USD and price in the native currency of the current chain
 *
 * @param currencyAddress
 * @param chainId
 * @param price
 * @param timestamp
 * @param options
 */
export const getUSDAndNativePrices = async (
  currencyAddress: string,
  chainId: number,
  price: string,
  timestamp: number,
  options?: {
    onlyUSD?: boolean;
    acceptStalePrice?: boolean;
  }
): Promise<USDAndNativePrices> => {
  let usdPrice: string | undefined;
  let nativePrice: string | undefined;

  const chain = OFT_CHAINS.find(c => c.id === chainId)
  const coingeckoNetworkId = chain?.coingeckoNetworkId;
  // Only try to get pricing data if the network supports it
  if (coingeckoNetworkId) {
    const currencyUSDPrice = await getAvailableUSDPrice(
      currencyAddress,
      chainId,
      timestamp,
      options?.acceptStalePrice
    );

    let nativeUSDPrice: Price | undefined;
    if (!options?.onlyUSD) {
      nativeUSDPrice = await getAvailableUSDPrice(
        AddressZero,
        chainId,
        timestamp,
        options?.acceptStalePrice
      );
    }

    const currency = await getCurrency(currencyAddress, chainId);
    if (currency && currency.decimals && currencyUSDPrice) {
      const currencyUnit = BigNumber.from(10).pow(currency.decimals);
      usdPrice = BigNumber.from(price).mul(currencyUSDPrice.value).div(currencyUnit).toString();
      if (nativeUSDPrice) {
        nativePrice = BigNumber.from(price)
          .mul(currencyUSDPrice.value)
          .mul(NATIVE_UNIT)
          .div(nativeUSDPrice.value)
          .div(currencyUnit)
          .toString();
      }
    }
  }

  // Make sure to handle the case where the currency is the native one (or the wrapped equivalent)
  if (
    [AddressZero, Weth[chainId]].includes(
      currencyAddress
    )
  ) {
    nativePrice = price;
  }

  return { usdPrice, nativePrice };
};

/**
 * Convert between currencies
 *
 * @param fromCurrencyAddress
 * @param toCurrency
 * @param chainId
 * @param price
 * @param timestamp
 * @param options
 */
export const getUSDAndCurrencyPrices = async (
  fromCurrencyAddress: string,
  toCurrency: string,
  chainId: number,
  price: string,
  timestamp: number,
  options?: {
    onlyUSD?: boolean;
    acceptStalePrice?: boolean;
  }
): Promise<USDAndNativePrices> => {
  let usdPrice: string | undefined;
  let nativePrice: string | undefined;
  const chain = OFT_CHAINS.find(c => c.id === chainId)

  // Only try to get pricing data if the network supports it
  if (chain?.coingeckoNetworkId) {
    // Get the FROM currency price
    const fromCurrencyUSDPrice = await getAvailableUSDPrice(
      fromCurrencyAddress,
      chainId,
      timestamp,
      options?.acceptStalePrice
    );

    let toCurrencyUSDPrice: Price | undefined;
    if (!options?.onlyUSD) {
      toCurrencyUSDPrice = await getAvailableUSDPrice(
        toCurrency,
        chainId,
        timestamp,
        options?.acceptStalePrice
      );
    }

    const currency = await getCurrency(fromCurrencyAddress, chainId);

    if (currency.decimals && fromCurrencyUSDPrice) {
      const currencyUnit = BigNumber.from(10).pow(currency.decimals);
      usdPrice = BigNumber.from(price).mul(fromCurrencyUSDPrice.value).div(currencyUnit).toString();
      if (toCurrencyUSDPrice) {
        nativePrice = BigNumber.from(price)
          .mul(fromCurrencyUSDPrice.value)
          .mul(NATIVE_UNIT)
          .div(toCurrencyUSDPrice.value)
          .div(currencyUnit)
          .toString();
      }
    }
  }

  return { usdPrice, nativePrice };
};
