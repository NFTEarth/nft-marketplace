import {useMemo, useState} from "react";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {zeroAddress} from "viem";
import Link from "next/link";
import Image from "next/legacy/image";
import {useMediaQuery} from "react-responsive";
import {useAccount} from "wagmi";

import {
  Box,
  Button,
  Flex,
  FormatCryptoCurrency,
  Switch,
  Text,
  ToggleGroup,
  ToggleGroupItem
} from "components/primitives";
import {Head} from "components/Head";
import Layout from "components/Layout";
import ChainToggle from "components/common/ChainToggle";
import HistoryTable from "components/fortune/HistoryTable";
import ClaimModal, {RewardInputType} from "components/fortune/ClaimModal";
import WithdrawModal from "components/fortune/WithdrawModal";
import BetaLogo from "components/fortune/BetaLogo";
import {useFortuneHistory, useFortuneUserWon, useMounted} from "hooks";
import {Round} from "hooks/useFortuneRound";

const typeToStatus: Record<string, number | undefined> = {
  "all": undefined,
  "completed": 3,
  "cancelled": 4
}

const FortuneHistory = () => {
  const [type, setType] = useState<string>("all")
  const [onlyYourRound, setOnlyYourRound] = useState<boolean>(false)
  const [totalUnclaimed, setTotalUnclaimed] = useState(0n)
  const { address } = useAccount()
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const { data: userWinningRounds, refetch: refetchReward } = useFortuneUserWon(address , {
    refreshInterval: 5000
  })
  const data = useFortuneHistory({
    first: 100,
    skip: 0,
    where: {
      status: typeToStatus[type],
      ...(onlyYourRound ? {
        "deposits_": {
          "depositor": address
        }
      } :  {})
    }
  })

  const rewards: RewardInputType[] = useMemo(() => {
    const claimList: Record<string, number[]> = {};
    let total = 0n;
    (userWinningRounds || []).forEach((r: Round) => {
      claimList[r.roundId] = r.deposits.filter(d => !d.claimed).map((d) => {
        total += ((BigInt(d.entriesCount) * BigInt(r.valuePerEntry)))
        return d.indice
      })

      if (!claimList[r.roundId].length) {
        delete claimList[r.roundId]
      }
    });

    setTotalUnclaimed(total);

    return Object.keys(claimList).map((k:string) => ({
      roundId: BigInt(k),
      prizeIndices: claimList[k].map(BigInt)
    }))
  }, [userWinningRounds])

  return (
    <Layout>
      <Head title={"History • Fortune | NFTEarth"}/>
      <Box
        css={{
          py: 24,
          px: '$3',
          height: '100%',
          pb: 160,
          '@md': {
            pb: 60,
            px: '$6',
          },
        }}
      >
        <Flex justify="between" css={{ mb: 30 }}>
          <Flex align="center" css={{ gap: 10 }}>
            <Image src="/images/fortune.png" width={40} height={40} objectFit="contain" alt="Fortune"/>
            <Text style="h4">Fortune</Text>
            <BetaLogo />
          </Flex>
          <ChainToggle />
        </Flex>
        <Flex
          direction="column"
          css={{ gap: 20 }}
        >
          <Link href="/fortune">
            <Flex align="center" css={{ gap: 20 }}>
              <FontAwesomeIcon icon={faArrowLeft} width={16} height={16} color="hsl(145, 25%, 39%)" />
              <Text css={{ color: '$primary9' }}>Current Round</Text>
            </Flex>
          </Link>
          <Flex
            justify="between"
            css={{
              gap: 20,
              flexDirection: 'column',
              '@md': {
                flexDirection: 'row',
              }
            }}
          >
            <Flex
              direction="column"
              justify="end"
              css={{
                gap: 20,
                order: 2,
                '@md': {
                  order: 1
                }
              }}
            >
              <Flex
                align="center"
                css={{
                  gap: 10,
                  justifyContent: 'space-between',
                  '@md': {
                    justifyContent: 'center',
                  }
                }}
              >
                <ToggleGroup
                  type="single"
                  value={type}
                  onValueChange={(value) => {
                    if (value) {
                      setType(value)
                    }
                  }}
                  css={{ flexShrink: 0 }}
                >
                  <ToggleGroupItem value="all" css={{ p: '$2' }}>
                    <Text>All</Text>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="completed" css={{ p: '$2' }}>
                    <Text>Completed</Text>
                  </ToggleGroupItem>
                  <ToggleGroupItem value="cancelled" css={{ p: '$2' }}>
                    <Text>Cancelled</Text>
                  </ToggleGroupItem>
                </ToggleGroup>
                <Flex
                  css={{
                    gap: 10
                  }}
                >
                  <Switch checked={onlyYourRound} onCheckedChange={setOnlyYourRound}/>
                  <Text>{isSmallDevice ? 'Yours' : 'Only Your Rounds'}</Text>
                </Flex>
              </Flex>
            </Flex>
            <Flex css={{
              gap: 20,
              order: 1,
              '@md': {
                order: 2
              },
              flexWrap: 'wrap'
            }}>
              <Flex
                justify="between"
                align="center"
                css={{
                  border: '1px solid $primary9',
                  borderRadius: 16,
                  gap: 40,
                  p: 16,
                }}
              >
                <WithdrawModal />
              </Flex>
              <Flex
                justify="between"
                align="center"
                css={{
                  border: '1px solid $primary9',
                  borderRadius: 16,
                  gap: 40,
                  p: 16,
                  order: 1,
                  '@md': {
                    order: 2
                  }
                }}
              >
                <Flex
                  direction="column"
                  css={{ gap: 10 }}
                >
                  <Text style="body3">Your Unclaimed Winnings</Text>
                  <FormatCryptoCurrency
                    amount={BigInt(totalUnclaimed || 0)}
                    address={zeroAddress}
                    logoHeight={18}
                    textStyle={'h6'}
                  />
                </Flex>
                <ClaimModal rewards={rewards} disabled={!(totalUnclaimed > BigInt(0))} onClose={refetchReward} />
              </Flex>
            </Flex>
          </Flex>
          <HistoryTable data={data}/>
        </Flex>
      </Box>
    </Layout>
  )
}

export default FortuneHistory;
