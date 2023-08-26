import {FC, useEffect} from "react";
import {TokenMedia, useTokens} from "@reservoir0x/reservoir-kit-ui";

import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";
import {Flex, FormatCryptoCurrency, Text, Tooltip} from "../primitives";

export enum TokenType {
  ERC20,
  ERC721,
  ERC1155
}

export type PrizeType = {
  type: TokenType,
  depositor?: `0x${string}`
  address: `0x${string}`
  price: bigint
  amount: bigint
  totalNumberOfEntries: number
  tokenId?: bigint
}

const FortunePrize : FC<{ data: PrizeType }> = ({ data, ...restProps }) => {
  const { data: tokens } = useTokens({
    tokens: [`${data.address}:${data.tokenId}`],
  }, {
    isPaused: () => data.type === TokenType.ERC20
  })

  const token = tokens && tokens[0] ? tokens[0] : undefined

  // TODO: Better data fetching & caching
  useEffect(() => {
    if (!data.price) {
      if (data.type === TokenType.ERC20) {
        data.price = Array.isArray(data.amount) ? data.amount
          .reduce((a, b) => a + b, BigInt(0)) : data.amount || BigInt(0)
        return;
      }
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