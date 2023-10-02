import {useEffect, useRef, useState} from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faClose} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";
import {
  useAccount,
  useContractWrite, useNetwork, useSwitchNetwork,
  useWaitForTransaction
} from "wagmi";

import * as Dialog from '@radix-ui/react-dialog'
import * as Tabs from '@radix-ui/react-tabs'
import Layout from "components/Layout";
import ProgressBar from "components/common/ProgressBar";
import GrandPrize from "components/raffle/GrandPrize";
import NFTPrizes from "components/raffle/NFTPrizes";
import {Box, Grid, Text, Flex, Button} from 'components/primitives'
import { AnimatedOverlay, AnimatedContent } from "components/primitives/Dialog";

import { useRaffle, useRaffleStats, useRaffleEntries } from "hooks";

import RaffleAbi from 'artifact/RaffleAbi'
import TokenPrize from "components/raffle/TokenPrize";
import EntryTab from "components/raffle/EntryTab";
import HistoryTab from "components/raffle/HistoryTab";
import useCountdown from "hooks/useCountdown";
import {formatNumber} from "utils/numbers";

export type RaffleEntryType = {
  amount: number,
  index: number,
  total: bigint
}

export default function Home() {
  const { address } = useAccount();
  const { chain: activeChain } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork();
  const entryRef = useRef<HTMLDivElement | null>();
  const raffleData = useRaffle(process.env.ACTIVE_RAFFLE_ID as string)
  const { total = 0 } = useRaffleEntries(process.env.ACTIVE_RAFFLE_ID as string) || {}
  const {
    amountPaid = {
      'type': 'BigNumber',
      'hex': '0x0'
    },
    entriesCount = 0,
    refunded = false
  } = useRaffleStats(process.env.ACTIVE_RAFFLE_ID as string, address) || {}
  const {
    owner,
    status,
    isMinimumEntriesFixed,
    cutoffTime,
    drawnAt,
    minimumEntries = 0,
    maximumEntriesPerParticipant = 0,
    feeTokenAddress,
    protocolFeeBp,
    claimableFees,
    pricing = [],
    prizes = [],
    tokens = []
  } = raffleData || {};

  const [days, hours, minutes, seconds] = useCountdown(cutoffTime * 1000)
  const [open, setOpen] = useState(false)
  const [buyAmount, setBuyAmount] = useState(1);
  const [entryIndex, setEntryIndex] = useState(0);
  const [totalPrice, setTotalPrice] = useState(BigInt(0));
  const [requestIndex, setRequestIndex] = useState(0);

  const { writeAsync: enterRaffles, data: raffleEntryData, isLoading, error } = useContractWrite({
    address: process.env.RAFFLE_CONTRACT_ADDRESS as `0x${string}`,
    abi: RaffleAbi,
    functionName: 'enterRaffles',
    args: [new Array(buyAmount).fill([process.env.ACTIVE_RAFFLE_ID, entryIndex])],
    value: totalPrice,
  })
  const { isLoading: isLoadingTransaction, isSuccess = true, data: txData } = useWaitForTransaction({
    hash: raffleEntryData?.hash,
  })

  useEffect(() => {
    setOpen(!!error || isLoading || isLoadingTransaction || isSuccess);
  }, [error, isLoading, isLoadingTransaction, isSuccess])

  useEffect(() => {
    if (requestIndex === 0) {
      return;
    }

    (async () => {
      if (switchNetworkAsync && activeChain?.id !== parseInt(process.env.CHAIN_ID as string)) {
        const chain = await switchNetworkAsync(parseInt(process.env.CHAIN_ID as string))
        if (chain.id !== parseInt(process.env.CHAIN_ID as string)) {
          return false
        }
      }

      console.log({
        buyAmount,
        entryIndex,
        totalPrice
      })

      enterRaffles?.()
    })()
  }, [requestIndex])

  const handleEntry = (data: { amount: number, index: number, total: bigint }) => {
    setBuyAmount(data.amount);
    setEntryIndex(data.index);
    setTotalPrice(data.total);
    setRequestIndex(requestIndex+1);
  }

  const tweetText = `I just joined the $NFTE #Raffle on @NFTEarth_L2!\n\n🎉 LFG #NFTE! 🎉\n\n`

  // @ts-ignore
  return (
    <Layout>
      <Box
        css={{
          height: '100%',
        }}
      >
        <Box
          css={{
            p: 24,
            height: '100%',
            '@bp800': {
              p: '$6',
            },
          }}
        >
          <Flex css={{ mb: '100px', gap: 50, flex: 1 }} direction="column" align="center">
            <Flex
              direction="row"
              align="center"
              justify="center"
              css={{
                gap: '0.5rem',
                flexWrap: 'wrap',
                textAlign: 'center'
              }}>
              <Text style="h3">{`Only `}</Text>
              <Text style="h3" css={{ color: '$primary9' }}>{formatNumber(minimumEntries - total)}</Text>
              <Text style="h3">{` entries until the raffle starts`}</Text>
            </Flex>
            <Flex direction="column" css={{
              width: '100%',
              '@bp800': {
                width: '50%'
              }
            }}>
              <Flex justify="end">
                <Text style="body2">{`${total}/${minimumEntries}`}</Text>
              </Flex>
              <ProgressBar percentage={(total / minimumEntries) * 100} />
            </Flex>
            <Flex css={{
              flex: 1,
              gap: 20,
              flexDirection: 'column',
              '@bp800': {
                flexDirection: 'row',
              },
            }}>
              <Flex>
                <GrandPrize prizes={prizes} tokens={tokens}/>
              </Flex>
              <Flex direction="column" css={{ gap: 20, flex: 1, height: 'fit-content', minHeight: 200}}>
                <NFTPrizes prizes={prizes} tokens={tokens}/>
                <TokenPrize prizes={prizes}/>
              </Flex>
            </Flex>
          </Flex>
          <Flex align="center" css={{ flex: 1, gap: 20  }} direction="column">
            <Flex css={{ flex: 1, textAlign: 'center' }} justify="center" direction="column">
              <Text style="h3">Feeling lucky?</Text>
            </Flex>
            <Flex css={{ flex: 1, textAlign: 'center' }} justify="center">
              <Button onClick={() => {
                entryRef.current?.scrollIntoView()
              }}>Enter Now</Button>
            </Flex>
            <Flex
              align="center"
              justify="center"
              css={{
                flexDirection: 'column',
                textAlign: 'center',
                '@bp800': {
                  gap: 10,
                  flexDirection: 'row',
                }
              }}
            >
              <Text>{`If the minimum number of entries isn't met in`}</Text>
              <Text color="primary">{`${days} days ${hours} hours ${minutes} minutes ${seconds} seconds`}</Text>
              <Text>{`you will be able to collect a refund.`}</Text>
            </Flex>
          </Flex>
          <Flex justify="center">
            <Tabs.Root className="TabsRoot" defaultValue="tab1" style={{ marginTop: 80 }}>
              <Tabs.List className="TabsList" aria-label="Manage your account">
                <Tabs.Trigger className="TabsTrigger" value="tab1">
                  Buy Raffle Entries
                </Tabs.Trigger>
                <Tabs.Trigger className="TabsTrigger" value="tab2">
                  My Raffle History
                </Tabs.Trigger>
              </Tabs.List>
              <Tabs.Content className="TabsContent" value="tab1">
                <EntryTab
                  handleEntry={handleEntry}
                  {...{
                    entryRef,
                    maximumEntriesPerParticipant,
                    entriesCount,
                    pricing,
                  }}
                />
              </Tabs.Content>
              <Tabs.Content className="TabsContent" value="tab2">
                <HistoryTab />
              </Tabs.Content>
            </Tabs.Root>
          </Flex>
        </Box>
      </Box>
      <Dialog.Root modal={true} open={open}>
        <Dialog.Portal>
          <AnimatedOverlay
            style={{
              position: 'fixed',
              zIndex: 1000,
              inset: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              backdropFilter: '20px',
            }}
          />
          <AnimatedContent style={{
            outline: 'unset',
            position: 'fixed',
            zIndex: 1000,
            transform: 'translate(-50%, 120%)',
          }}>
            <Flex
              justify="between"
              css={{
                pt: '$5',
                background: '$gray7',
                padding: '$5',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '20px',
                '@bp600': {
                  flexDirection: 'column',
                  gap: '20px',
                },
              }}
            >
              {!!error && (
                <Dialog.Close asChild>
                  <button
                    style={{
                      position: 'absolute',
                      top: 10,
                      right: 15
                    }}
                    onClick={() => setOpen(!open)}
                    className="IconButton"
                    aria-label="Close"
                  >
                    <FontAwesomeIcon icon={faClose} size="xl" />
                  </button>
                </Dialog.Close>
              )}
              {isLoading && (
                <Text style="h6">Please confirm in your wallet</Text>
              )}
              {isLoadingTransaction && (
                <Text style="h6">Processing your entry...</Text>
              )}
              {!!error && (
                <Text style="h6" css={{ color: 'red' }}>{(
                  error as any)?.reason ||
                // @ts-ignore
                error?.data?.message ||
                error?.message
                }</Text>
              )}
              {isSuccess && (
                <>
                  <Text style="h6" css={{ color: 'green' }}>Raffle Entry Success!</Text>
                  <Link
                    rel="noreferrer noopener"
                    target="_blank"
                    href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://nftearth.exchange/claim`)}&hashtags=&via=&related=&original_referer=${encodeURIComponent('https://nftearth.exchange')}`}>
                    <Button>
                      {`Tweet about your raffle entry!`}
                      <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTwitter}/>
                    </Button>
                  </Link>
                </>
              )}
            </Flex>
          </AnimatedContent>
        </Dialog.Portal>
      </Dialog.Root>
    </Layout>
  )
}
