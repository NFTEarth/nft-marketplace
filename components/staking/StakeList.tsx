import {FC} from "react";
import Link from "next/link";
import {arbitrum} from "viem/chains";

import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";

import {formatBN} from "utils/numbers";
import dayjs from "dayjs";

type Props = {
  lockedBalance: bigint
  lockEndTimestamp: bigint
}

const StakeList : FC<Props> = (props) => {
  const { lockedBalance, lockEndTimestamp } = props

  return (
    <>
      {parseInt(lockedBalance?.toString() || '0') > 0 ? (
        <Button
          as={Link}
          href="/staking/arbitrum"
          css={{
            p: '1rem',
            minWidth: '16.125rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'transparent',
            borderWidth:  1,
            borderStyle: 'solid',
            transition: 'border-color 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: '#79ffa8',
            }
          }}
        >
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <CryptoCurrencyIcon
              address="0x82496243c0a1a39c5c6250bf0115c134Ba76698c"
              chainId={arbitrum.id}
              css={{
                width: 20,
                height: 20
              }}
            />
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src="/icons/arbitrum-icon-dark.svg" width={14} height={14}  alt="Arbitrum"/>
              <Text style="body3" color="dark">Arbitrum</Text>
            </Flex>
          </Flex>
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Flex
              direction="column"
            >
              <Text style="body3">Token</Text>
              <Text style="h6">NFTE/WETH LP</Text>
            </Flex>
          </Flex>
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Flex
              direction="column"
            >
              <Text style="body3">Locked Balance</Text>
              <Text style="subtitle1">{formatBN(lockedBalance || BigInt(0), 2, 18, { notation: "standard" })}</Text>
            </Flex>
            <Flex
              direction="column"
            >
              <Text style="body3">Days Left</Text>
              <Text style="subtitle1" css={{ textAlign: 'right' }}>{dayjs(+`${lockEndTimestamp}` * 1000).diff(dayjs(), 'days')}</Text>
            </Flex>
          </Flex>
        </Button>
      ) : (
        <Box
          css={{
            border: '1px dashed #79ffa8',
            opacity: 0.2,
            minWidth: '16.125rem',
            background: '#323232',
            minHeight: '9.875rem',
            borderRadius: '0.75rem',
            content: ' '
          }}
        />
      )}
      {/*{(new Array(3).fill('')).map((x, i) => (*/}
      {/*  <Box*/}
      {/*    key={`box-${i}`}*/}
      {/*    css={{*/}
      {/*      border: '1px dashed #79ffa8',*/}
      {/*      opacity: 0.2,*/}
      {/*      minWidth: '16.125rem',*/}
      {/*      background: '#323232',*/}
      {/*      minHeight: '9.875rem',*/}
      {/*      borderRadius: '0.75rem',*/}
      {/*      content: ' '*/}
      {/*    }}*/}
      {/*  />*/}
      {/*))}*/}
    </>
  )
}

export default StakeList