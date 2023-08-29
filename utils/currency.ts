
import db from "lib/db";
import {OFT_CHAINS} from "./chains";
import {AlchemyProvider, Interface, Contract} from "ethers";

const currency = db.collection('currency')

type CurrencyMetadata = {
  coingeckoCurrencyId?: string;
  image?: string;
};

export type Currency = {
  contract: string;
  name?: string;
  symbol?: string;
  decimals?: number;
  metadata?: CurrencyMetadata;
  chainId: number
};

const CURRENCY_MEMORY_CACHE: Map<string, Currency> = new Map<string, Currency>();
export const getCurrency = async (currencyAddress: string, chainId: number): Promise<Currency> => {
  if (!CURRENCY_MEMORY_CACHE.has(`${currencyAddress}:${chainId}`)) {
    const result = await currency.findOne({
      contract: currencyAddress,
      chainId
    });

    if (result) {
      CURRENCY_MEMORY_CACHE.set(`${currencyAddress}:${chainId}`, {
        contract: currencyAddress,
        name: result.name,
        symbol: result.symbol,
        decimals: result.decimals,
        metadata: result.metadata,
        chainId,
      });
    } else {
      let name: string | undefined;
      let symbol: string | undefined;
      let decimals: number | undefined;
      let metadata: CurrencyMetadata | undefined;

      // If the currency is not available, then we try to retrieve its details
      try {
        ({ name, symbol, decimals, metadata } = await tryGetCurrencyDetails(currencyAddress, chainId));
      } catch (error) {
        console.error(
          "currencies",
          `Failed to initially fetch ${currencyAddress} currency details: ${error}`
        );
      }

      metadata = metadata || {};

      await currency.insertOne({
        contract: currencyAddress,
        name,
        symbol,
        decimals,
        metadata,
        chainId
      });

      // Update the in-memory cache
      CURRENCY_MEMORY_CACHE.set(`${currencyAddress}:${chainId}`, {
        contract: currencyAddress,
        name,
        symbol,
        decimals,
        metadata,
        chainId
      });
    }
  }

  return CURRENCY_MEMORY_CACHE.get(`${currencyAddress}:${chainId}`)!;
};

export const tryGetCurrencyDetails = async (currencyAddress: string, chainId: number) => {
  // `name`, `symbol` and `decimals` are fetched from on-chain
  const iface = new Interface([
    "function name() view returns (string)",
    "function symbol() view returns (string)",
    "function decimals() view returns (uint8)",
  ]);

  const provider = new AlchemyProvider(chainId, process.env.NEXT_PUBLIC_ALCHEMY_ID);
  const contract = new Contract(currencyAddress, iface, provider);
  const name = await contract.name();
  const symbol = await contract.symbol();
  const decimals = await contract.decimals();
  const metadata: CurrencyMetadata = {};

  const chain = OFT_CHAINS.find(c => c.id === chainId)
  const coingeckoNetworkId = chain?.coingeckoNetworkId;
  if (coingeckoNetworkId) {
    const result: { id?: string; image?: { large?: string } } = await fetch(
        `https://api.coingecko.com/api/v3/coins/${coingeckoNetworkId}/contract/${currencyAddress}`,
      )
      .then(response => response.json());
    if (result.id) {
      metadata.coingeckoCurrencyId = result.id;
    }
    if (result.image?.large) {
      metadata.image = result.image.large;
    }
  }

  // Make sure to update the in-memory cache
  CURRENCY_MEMORY_CACHE.set(`${currencyAddress}:${chainId}`, {
    contract: currencyAddress,
    name,
    symbol,
    decimals,
    metadata,
    chainId
  });

  return {
    name,
    symbol,
    decimals,
    metadata,
  };
};
