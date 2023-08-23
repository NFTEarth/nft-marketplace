import {Box, Flex, FormatCryptoCurrency, Text, Tooltip} from "../primitives";
import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";
import {TokenMedia, useTokens} from "@reservoir0x/reservoir-kit-ui";
import {FC} from "react";

export type PrizeType = {
  type: 'erc721' | 'erc1155' | 'erc20',
  bidderName: string,
  address: `0x${string}`
  price: bigint
  amount?: bigint
  tokenId?: bigint
}

const FortunePrize : FC<{ data: PrizeType}> = ({ data, ...restProps }) => {
  const { data: tokens } = useTokens({
    tokens: [`${data.address}:${data.tokenId}`],
  })

  const token = tokens && tokens[0] ? tokens[0] : undefined

  return (
    <Tooltip
      side="top"
      content={
        <Text style="body3" as="p">
          Not tradeable on OpenSea
        </Text>
      }
    >
      <Flex
        title={data.bidderName}
        direction="column"
        css={{
          overflow: 'hidden',
          borderRadius: 6,
          border: '1px solid $gray8',
          position: 'relative',
          cursor: 'pointer',
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
          {data.type === 'erc20' && (
            <CryptoCurrencyIcon
              address={data.address}
              css={{ height: 50 }}
            />
          )}

          {['erc721', 'erc1155'].includes(data.type) && (
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