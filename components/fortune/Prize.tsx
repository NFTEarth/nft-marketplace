import {FC, useEffect} from "react";
import {TokenMedia, useTokens} from "@reservoir0x/reservoir-kit-ui";

import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";
import {Box, Flex, FormatCryptoCurrency, Text, Tooltip} from "../primitives";
import {useFortune, useMarketplaceChain} from "hooks";
import {setParams} from "@reservoir0x/reservoir-sdk";
import {AddressZero} from "@ethersproject/constants";
import {useAccount} from "wagmi";

export enum TokenType {
  ERC20,
  ERC721,
  ERC1155
}

export type ReservoirFloorPrice = {
  id: `0x${string}`
  payload: `0x${string}`
  timestamp: number
  signature: `0x${string}`
}

export type PrizeType = {
  type: TokenType,
  depositor: `0x${string}` | `0x${string}`[]
  address: `0x${string}`
  price: bigint
  amount: bigint | bigint[]
  totalNumberOfEntries: number
  tokenId?: bigint
  reservoirOracleFloorPrice?: ReservoirFloorPrice
}

type ReservoirOracleFloorPriceResponse = {
  price: number
  message: ReservoirFloorPrice
}

const FortunePrize : FC<{ data: PrizeType}> = ({ data, ...restProps }) => {
  const { data: tokens } = useTokens({
    tokens: [`${data.address}:${data.tokenId}`],
  }, {
    isPaused: () => data.type === TokenType.ERC20
  })
  const { address } = useAccount()
  const { data: prizes, setPrizes } = useFortune<PrizeType[]>(d => d.prizes)
  const marketplaceChain = useMarketplaceChain()
  const token = tokens && tokens[0] ? tokens[0] : undefined

  // TODO: Better data fetching & caching
  useEffect(() => {
    if (!data.price) {
      if (data.type === TokenType.ERC20) {
        data.price = Array.isArray(data.amount) ? data.amount
          .reduce((a, b) => a + b, BigInt(0)) : data.amount || BigInt(0)
        return;
      }

      const path = new URL(marketplaceChain.proxyApi, window.location.origin);

      setParams(path, {
        kind: 'twap',
        currency: '0x0000000000000000000000000000000000000000',
        twapSeconds: '1',
        collection: data.address
      })

      fetch(path.href)
        .then(res => res.json())
        .then(res => {
          setPrizes?.(prizes.map(p => {
            if (p.address === data.address) {
              p.price = res.price
              p.reservoirOracleFloorPrice = {
                id: res.message.id,
                payload: res.message.payload,
                timestamp: res.message.timestamp,
                signature: res.message.signature
              }
            }

            return p;
          }))
        }).catch(() => {
        // Empty
      })
    }
  }, [data])

  return (
    <Tooltip
      side="top"
      content={
        <Flex direction="column" css={{ gap: 10 }}>
          {Array.isArray(data.depositor) ? data.depositor.map(d => (
            <Text key={d} style="body3" as="p">
              {d}
            </Text>
          )) : (
            <Text style="body3" as="p">
              {data.depositor}
            </Text>
          )}
        </Flex>
      }
    >
      <Flex
        direction="column"
        css={{
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid $gray8',
          position: 'relative',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'filter, transform .5s',
          '&:hover': {
            filter: 'opacity(0.7)',
            transform: 'translateY(-5px)'
          }
        }}
        {...restProps}
      >
        <Flex
          align="center"
          justify="center"
          css={{
            width: 96,
            height: 96,
            backgroundImage: 'linear-gradient(180deg, $primary9 0%, $primary8 100%)'
          }}
        >
          {data.type === TokenType.ERC20 && (
            <CryptoCurrencyIcon
              address={data.address}
              css={{ height: 50 }}
            />
          )}

          {[TokenType.ERC721, TokenType.ERC1155].includes(data.type) && (
            <TokenMedia
              token={token?.token}
              style={{
                width: 96,
                height: 96,
                aspectRatio: '1/1',
              }}
            />
          )}
        </Flex>
        <Flex css={{ p: '$2'}}>
          <FormatCryptoCurrency amount={data.price} />
        </Flex>
      </Flex>
    </Tooltip>
  )
}

export default FortunePrize;