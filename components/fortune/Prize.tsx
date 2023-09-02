import {FC, useEffect} from "react";
import {TokenMedia, useTokens} from "@reservoir0x/reservoir-kit-ui";

import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";
import {Flex, FormatCryptoCurrency, Text, Tooltip} from "../primitives";
import Player, {PlayerType} from "./Player";
import {AddressZero} from "@ethersproject/constants";

export type TokenType = 'ETH' | 'ERC20' | 'ERC721'
export type PrizeDepositor = {
  player: PlayerType
  amount: bigint
}

export type PrizeType = {
  type: TokenType,
  depositors: PrizeDepositor[]
  address: `0x${string}`
  price: bigint
  amount: bigint
  totalNumberOfEntries: bigint
  tokenId?: bigint
}

const FortunePrize : FC<{ data: PrizeType, valuePerEntry: bigint }> = ({ data, valuePerEntry, ...restProps }) => {
  const { data: tokens } = useTokens({
    tokens: [`${data.address}:${data.tokenId}`],
  }, {
    isPaused: () => ['ERC20', 'ETH'].includes(data.type)
  })

  const token = tokens && tokens[0] ? tokens[0] : undefined

  return (
    <Tooltip
      side="top"
      content={
        <Flex direction="column" css={{ gap: 10 }}>
          {data.depositors.map((d, i) => (
            <Player
              key={`depositor-${i}`}
              data={d.player}
              valuePerEntry={valuePerEntry}
            />
          ))}
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
          {['ERC20', 'ETH'].includes(data.type) && (
            <CryptoCurrencyIcon
              address={data.address}
              css={{ height: 50 }}
            />
          )}

          {data.type === 'ERC721' && (
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
          <FormatCryptoCurrency amount={data.amount || data.price} decimals={18} address={data.type === 'ERC721' ? AddressZero : data.address} />
        </Flex>
      </Flex>
    </Tooltip>
  )
}

export default FortunePrize;