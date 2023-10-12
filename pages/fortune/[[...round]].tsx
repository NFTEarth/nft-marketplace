import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {GetStaticPaths, GetStaticProps, InferGetStaticPropsType, NextPage} from "next";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faForwardStep,
  faHistory,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {useCoinConversion} from "@reservoir0x/reservoir-kit-ui";
import {useMediaQuery} from "react-responsive";
import {useAccount} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useRouter} from "next/router";
import {formatUnits, parseEther} from "viem";
import {AddressZero} from "@ethersproject/constants"
import Link from 'next/link'
import Image from "next/legacy/image"

import Layout from 'components/Layout'
import Wheel from "components/fortune/Wheel";
import EntryForm from "components/fortune/EntryForm";
import Player, {PlayerType} from "components/fortune/Player";
import FortunePrize, {PrizeType} from "components/fortune/Prize";
import Confetti from "components/common/Confetti";
import ChainToggle from "components/common/ChainToggle";
import LoadingSpinner from "components/common/LoadingSpinner";
import {Box, Button, Flex, FormatCryptoCurrency, Text} from 'components/primitives'
import FortuneEnterButton from "components/fortune/EnterButton";
import FortuneDepositModal from "components/fortune/DepositModal";
import FortuneRoundStatus from "components/fortune/RoundStatus";
import FortuneFooter from "components/fortune/Footer";
import BetaLogo from "components/fortune/BetaLogo";
import Head from "components/fortune/Head";
import {
  useFortune,
  useMarketplaceChain,
  useMounted,
  useFortuneStatus,
  useFortuneRound,
  useCountdown
} from "hooks";
import {Deposit, Round, RoundStatus} from "hooks/useFortuneRound";
import {FortuneStatus} from "hooks/useFortuneStatus";

import {styled} from 'stitches.config'
import supportedChains, {FORTUNE_CHAINS} from "utils/chains";
import {basicFetcher} from "utils/fetcher";
import {arbitrum} from "viem/chains";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";

type FortuneData = {
  enableAudio: boolean
  players: PlayerType[]
  usdConversion: number
  durationLeft: number
  valueEth: string
  selections: Selection[]
}

const Video = styled('video', {});

const convertTimer = (minutes: number, seconds: number) : string => {
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

type Props = InferGetStaticPropsType<typeof getStaticProps>

const FortunePage : NextPage<Props> = ({ id, ssr }) => {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [playerWinner, setPlayerWinner] = useState<PlayerType>()
  const [activeRound, setActiveRound] = useState<number>()
  const prizePotRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<any>(null);
  const router = useRouter()
  const { isLoading: isLoadingCurrentRound } = useFortuneStatus({
    isPaused: () => {
      return !!activeRound
    },
    onSuccess: ({ fortune } : { fortune: FortuneStatus }) => {
      setActiveRound(fortune?.currentRound?.roundId)
    },
    refreshInterval: 1000,
  })
  const { data: roundData } = useFortuneRound(parseInt((id || '0')) || activeRound || 1, {
    refreshInterval: 1000,
    isPaused: () => !(parseInt(`${router.query?.round || 0}`) || activeRound),
    fallbackData: {
      round: ssr.round
    }
  })

  const { data: {
    players,
    enableAudio,
    valueEth,
    selections,
  }, setRound, setPlayers, setEnableAudio } = useFortune<FortuneData>(d => d)
  const { openConnectModal } = useConnectModal()
  const marketplaceChain = useMarketplaceChain()
  const { address } = useAccount()
  const mounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 })

  const [prizes, setPrizes] = useState<PrizeType[]>([{
    type: 'ETH',
    depositors: [],
    address: AddressZero,
    price: BigInt(0),
    amount: BigInt(0),
    totalNumberOfEntries: BigInt(0)
  }])

  const cutOffTime = useMemo(() => roundData?.cutoffTime || 0, [roundData])
  const parsedEthValue = BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString())
  const [_hours, minutes, seconds] = useCountdown(cutOffTime * 1000)
  const isEnded = minutes === 0 && seconds === 0

  const convertedCountdown = convertTimer(minutes, seconds)

  const usdConversions = useCoinConversion(
    'USD',
    'ETH,NFTE',
    'ethereum,nftearth'
  )

  const currencyToUsdConversions = usdConversions.reduce((map, data) => {
    map[data.symbol] = data
    map[(data as any).coinGeckoId] = data
    return map
  }, {} as Record<string, (typeof usdConversions)[0]>)

  const totalPrize =BigInt(roundData?.numberOfEntries || 0) * BigInt(roundData?.valuePerEntry || 0)
  const yourEntries = BigInt(roundData?.deposits?.filter(p => (new RegExp(address as string, 'i').test(p.depositor as string)))
    .reduce((a, b) => a + BigInt(b.participant.totalNumberOfEntries || 0), BigInt(0)) || 0) * BigInt(roundData?.valuePerEntry || 0)
  const currentPlayer = players.find(p => (new RegExp(address as string, 'i')).test(p.address));
  const yourWinChance = currentPlayer ? Math.round((+`${currentPlayer?.entry}` || 1) / (+`${roundData?.numberOfEntries}` || 1) * 100) : 0
  const ethConversion =
    currencyToUsdConversions['ETH']
  const totalPrizeUsd =
    Number(formatUnits(BigInt(totalPrize), marketplaceChain.nativeCurrency.decimals || 18)) *
    (ethConversion?.price || 0)

  useEffect(() => {
    let newPrizes: PrizeType[] = [
      {
        type: 'ETH',
        depositors: [],
        address: AddressZero,
        price: BigInt(0),
        amount: BigInt(0),
        totalNumberOfEntries: BigInt(0)
      }
    ];
    const newPlayers: PlayerType[] = [];

    (roundData?.deposits || []).forEach((d: Deposit) => {
      const winChance = ((+`${d.participant.totalNumberOfEntries}` || 1) / (+`${roundData?.numberOfEntries}` || 1) * 100)
      const colorHash = Math.floor(+d.depositor*16777215).toString(16)
      const existingPlayer = newPlayers.findIndex(p => p.address === d.depositor)

      let player = {
        index: newPlayers.length,
        address: d.depositor as `0x${string}`,
        entry: d.participant.totalNumberOfEntries,
        y: winChance,
        color: `#${colorHash.substring(0, 2)}${colorHash.substring(8, 10)}${colorHash.substring(16, 18)}`
      };

      if (existingPlayer > -1) {
        newPlayers[existingPlayer].entry = d.participant.totalNumberOfEntries
        newPlayers[existingPlayer].y = winChance
      } else {
        newPlayers.push(player)
      }

      if (d.tokenType === 'ETH') {
        newPrizes = newPrizes.map((p, i) => {
          if (i === 0) {
            const existingPlayerDepositIndex = p.depositors.findIndex(d => d.player.address === player.address)
            if (existingPlayerDepositIndex > -1) {
              p.depositors[existingPlayerDepositIndex].amount += BigInt(d.tokenAmount)
            } else {
              p.depositors.push({
                player,
                amount: BigInt(d.tokenAmount)
              });
            }
            p.amount = p.amount + BigInt(d.tokenAmount)
          }

          return p
        })
      }

      if (d.tokenType === 'ERC20') {
        const currentPrizeIndex: number = newPrizes.findIndex(p => p.address === d.tokenAddress)
        if (currentPrizeIndex > -1) {
          newPrizes = newPrizes.map((p, i) => {
            if (i === 0) {
              const existingPlayerDepositIndex = p.depositors.findIndex(d => d.player.address === player.address)
              if (existingPlayerDepositIndex > -1) {
                p.depositors[existingPlayerDepositIndex].amount += BigInt(d.tokenAmount)
              } else {
                p.depositors.push({
                  player,
                  amount: BigInt(d.tokenAmount)
                });
              }
              p.amount += BigInt(d.tokenAmount)
            }

            return p
          })
        } else {
          newPrizes.push({
            type: d.tokenType,
            depositors: [
              {
                player,
                amount: BigInt(d.tokenAmount)
              }
            ],
            address: d.tokenAddress as `0x${string}`,
            price: BigInt(0),
            amount: BigInt(d.tokenAmount),
            tokenId: BigInt(d.tokenId),
            totalNumberOfEntries: BigInt(d.participant.totalNumberOfEntries)
          })
        }
      }

      if (d.tokenType === 'ERC721') {
        newPrizes.push({
          type: d.tokenType,
          depositors: [
            {
              player,
              amount: BigInt(d.tokenAmount)
            }
          ],
          address: d.tokenAddress as `0x${string}`,
          price: BigInt(d.entriesCount) * BigInt(roundData.valuePerEntry),
          amount: BigInt(d.tokenAmount),
          tokenId: BigInt(d.tokenId),
          totalNumberOfEntries: BigInt(d.participant.totalNumberOfEntries)
        })
      }
    })

    setPrizes(newPrizes)
    setPlayers?.({
      type: 'set',
      payload: newPlayers
    })
  }, [roundData?.deposits])

  useEffect(() => {
    setPlayerWinner(undefined)
  }, [roundData?.roundId])

  useEffect(() => {
    setRound?.(roundData)

    return () => {
      setRound?.(null)
    }
  }, [roundData])

  useEffect(() => {
    if ([RoundStatus.Cancelled, RoundStatus.Drawn].includes(roundData?.status) && !router.query.round) {
      setTimeout(() => {
        setActiveRound(undefined)
      }, 3 * 1000)
    }

    if (roundData?.status !== RoundStatus.Open) {
      if (showEntryForm) {
        setShowEntryForm(false);
      }
    }
  }, [roundData?.status, router])

  useEffect(() => {
    if (!!router.query.round) {
      return;
    }

    if (playerWinner) {
      setTimeout(() => {
        setActiveRound(undefined)
      }, 10 * 1000)
    }
  }, [playerWinner, router])

  const handleEnter = useCallback((e: Event) => {
    e.preventDefault()

    if (!address) {
      return openConnectModal?.();
    }

    setShowEntryForm(true);
  }, [address])

  if (!FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id) && mounted) {
    return (
      <Layout>
        <Head
          status={roundData?.status}
          totalPrize={totalPrize}
          convertedCountdown={convertedCountdown}
        />
        <Box
          css={{
            py: 24,
            px: '$3',
            height: '100%',
            pb: 20,
            '@md': {
              pb: 60,
              px: '$6',
            },
          }}
        >
          <Flex
            align="center"
            justify="center"
            direction="column"
            css={{
              p: 40,
              height: '80vh',
              gap: 40,
              textAlign: 'center'
            }}
          >
            <Text style="h4">{`Fortune currently only supported on ${FORTUNE_CHAINS.map((chain) => {
              return supportedChains.find(c => c.id === chain.id)?.name || ''
            }).join(', ')}`}</Text>

            <ChainToggle/>
          </Flex>
        </Box>
      </Layout>
    )
  }

  return (
    <Layout>
      <AlertChainSwitch chainId={arbitrum.id}/>
      {enableAudio && (
        <audio autoPlay playsInline loop hidden>
          <source src="/audio/bgm-low.webm" />
          <source src="/audio/bgm-low.mp3" />
        </audio>
      )}
      <Head
        status={roundData?.status}
        totalPrize={totalPrize}
        convertedCountdown={convertedCountdown}
      />
      <Box
        css={{
          py: 24,
          px: '$3',
          height: '100%',
          pb: 20,
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
        <Box css={{
          gap: 10,
          display: 'grid',
          height: '100%',
          gridTemplateAreas: '"main" "player" "stat" "pot" "cta"',
          gridTemplateRows: showEntryForm ? '1fr' : 'unset',
          gridTemplateColumns: showEntryForm ? '1fr' : '100%',
          '@md': {
            gridTemplateAreas: '"main stat" "main cta" "player cta" "player cta" "pot pot"',
            gridTemplateRows: showEntryForm ? '1fr' : 'unset',
            gridTemplateColumns: showEntryForm ? '1fr' : '60% 40%',
            gap: 30,
          },
          '@lg': {
            gridTemplateAreas: showEntryForm ?
              '"main main main stat" "main main main cta" "main main main cta" "main main main cta"' :
              '"player main main stat" "player main main cta" "player main main cta" "pot pot pot cta"',
            gridTemplateRows: showEntryForm ? 'repeat(4, 1fr)' : 'unset',
            gridTemplateColumns: 'repeat(4, 1fr)',
          }
        }}>
          {!showEntryForm && (
            <>
              <Flex
                direction="column"
                css={{
                  borderRadius: 10,
                  backgroundColor: '$gray3',
                  p: '$4',
                  gridArea: 'player'
                }}
              >
                <Text css={{ mb: '$4', p: '$2' }}>{`${players.length} Players`}</Text>
                <Flex direction="column" css={{
                  gap: 5,
                  maxHeight: 400,
                  overflowY: 'auto'
                }}>
                  {players.map((p, i) => (
                    <Player
                      key={`player-${i}`}
                      valuePerEntry={roundData?.valuePerEntry}
                      data={p}
                    />
                  ))}
                </Flex>
              </Flex>
              <Flex
                direction="column"
                css={{
                  p: '$3',
                  borderRadius: 10,
                  backgroundColor: '$gray3',
                  justifyContent: 'space-between',
                  gridArea: 'main',
                }}
              >
                <Flex align="center" justify="between">
                  <Text>{roundData?.roundId === activeRound ? `Current Round` : `Round ${roundData?.roundId || '-'}`}</Text>
                  <Flex css={{ gap: 10 }}>
                    <Link href="/fortune/history" passHref legacyBehavior>
                      <Button as="a" size="xs" color="primary">
                        <FontAwesomeIcon icon={faHistory} width={15} height={15}/>
                        {(mounted && !isMobile) && (
                          <span>{`History`}</span>
                        )}
                      </Button>
                    </Link>
                    <Link href={((+roundData?.roundId - 1) < 1) ? '/fortune' : `/fortune/${+roundData?.roundId - 1}`} legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || (+roundData?.roundId - 1) < 1}>
                        <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href={+roundData?.roundId === +(activeRound || 1) ? '/fortune' : `/fortune/${+roundData?.roundId + 1}`} legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || !activeRound || +roundData?.roundId === +(activeRound || 1)}>
                        <FontAwesomeIcon icon={faArrowRight} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href="/fortune" legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || !activeRound || +roundData?.roundId === +(activeRound || 1)}>
                        <FontAwesomeIcon icon={faForwardStep} width={15} height={15}/>
                      </Button>
                    </Link>
                  </Flex>
                </Flex>
                <Flex
                  align="center"
                  direction="column"
                  css={{
                    width: '100%',
                    minWidth: 380,
                    maxWidth: '45vh',
                    alignSelf: 'center'
                  }}
                >
                  <Box css={{
                    position: 'relative',
                    width: '100%',
                    pt: '100%'
                  }}>
                    <Wheel
                      isEnded={isEnded}
                      winner={roundData?.winner as `0x${string}`}
                      onWheelEnd={(winnerIndex: number) => {
                        setPlayerWinner(players[winnerIndex])
                        confettiRef.current?.fireConfetti?.();
                      }}
                      style={{
                        position: 'absolute',
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                      }}
                    />
                    <FortuneRoundStatus
                      totalPrize={totalPrize}
                      totalPrizeUsd={totalPrizeUsd}
                      winner={playerWinner}
                      loadingNewRound={isLoadingCurrentRound || !activeRound}
                    />
                  </Box>
                </Flex>
                <Flex justify="end">
                  <Button
                    color="ghost"
                    size="xs"
                    css={{
                      backgroundColor: 'hsla(111,100%,74%, 0.1)',
                      px: 10
                    }}
                    onClick={() => {
                      setEnableAudio?.(!enableAudio)
                    }}
                  >
                    <FontAwesomeIcon
                      icon={enableAudio ? faVolumeUp : faVolumeMute}
                      color={enableAudio ? '#8EFF7A' : '#F00'}
                      width={20}
                      height={20}
                    />
                  </Button>
                </Flex>
              </Flex>
            </>
          )}
          <EntryForm
            roundId={roundData?.roundId}
            show={showEntryForm}
            onClose={() => setShowEntryForm(false)}
          />
          {mounted && (
            <Flex
              direction="column"
              justify="center"
              css={{
                borderRadius: 10,
                backgroundColor: '$gray3',
                p: '$4',
                display: 'none',
                '@md': {
                  display: 'flex'
                },
              }}>
              <Flex justify="between" align="center">
                <Text style="h5">{`Round ${roundData?.roundId || '-'}`}</Text>
                {roundData?.status === RoundStatus.Open && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      border: '1px solid $primary9',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  >
                    <Text style="h5">{`${convertedCountdown}`}</Text>
                  </Flex>
                )}
                {[RoundStatus.Drawing].includes(roundData?.status) && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      backgroundColor: 'primary',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  >
                    <LoadingSpinner css={{ width: 35, height: 35 }} />
                  </Flex>
                )}

                {[RoundStatus.Drawn, RoundStatus.Cancelled, RoundStatus.None].includes(roundData?.status) && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      backgroundColor: 'primary',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  />
                )}
              </Flex>
              <Flex css={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <FormatCryptoCurrency textStyle="h5" amount={totalPrize} />
                  <Text style="subtitle2">Prize Pool</Text>
                </Flex>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <Text style="h5">{`${players.length}/${roundData?.maximumNumberOfParticipants || 0}`}</Text>
                  <Text style="subtitle2">Players</Text>
                </Flex>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <FormatCryptoCurrency textStyle="h5" amount={yourEntries} />
                  <Text style="subtitle2">Your Entries</Text>
                </Flex>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <Text style="h5">{`${yourWinChance}%`}</Text>
                  <Text style="subtitle2">Your Odds To Win</Text>
                </Flex>
              </Flex>
            </Flex>
          )}
          {!showEntryForm && (
            <>
              <Flex
                direction="column"
                css={{
                  borderRadius: 10,
                  backgroundColor: '$gray3',
                  gridArea: 'pot',
                  gap: 20,
                  p: '$4'
                }}>
                <Flex justify="between" align="center">
                  <Text>Prize Pool</Text>
                  <Flex css={{ gap: 10 }}>
                    <Button size="xs" color="primary" onClick={() => {
                      if (prizePotRef.current) {
                        prizePotRef.current.scrollBy(-100, 0)
                      }
                    }}>
                      <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                    </Button>
                    <Button size="xs" color="primary"  onClick={() => {
                      if (prizePotRef.current) {
                        prizePotRef.current.scrollBy(100, 0)
                      }
                    }}>
                      <FontAwesomeIcon icon={faArrowRight} width={15} height={15}/>
                    </Button>
                  </Flex>
                </Flex>
                <Flex
                  ref={prizePotRef}
                  css={{
                    overflowX: 'auto',
                    scrollBehavior: 'smooth',
                  }}
                >
                  <Flex
                    align="center"
                    direction="row"
                    css={{
                      gap: 20
                    }}
                  >
                    {prizes.filter(p => p.amount > 0 || !!p.tokenId).map((prize, i: number) => (
                      <FortunePrize
                        key={`prize-${i}`}
                        data={prize}
                        valuePerEntry={roundData?.valuePerEntry}
                      />
                    ))}
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                direction="column"
                justify="center"
                align="center"
                css={{
                  borderRadius: 10,
                  backgroundColor: '$gray3',
                  p: '$4',
                  overflow: 'hidden',
                  position: 'relative',
                  gridArea: 'cta',
                  display: 'none',
                  '@md': {
                    display: 'flex'
                  }
                }}>
                <Video
                  autoPlay
                  loop
                  muted
                  playsInline
                  css={{
                    objectFit: 'cover',
                    minWidth: '100%',
                    minHeight: '100%',
                    width: 'auto',
                    height:'auto',
                    position: 'absolute',
                    zIndex: 0,
                    display: 'none',
                    transition: 'filter .5s',
                    '&:hover': {
                      filter: 'grayscale(1)'
                    },
                    '@md': {
                      display: 'block'
                    }
                  }}
                >
                  <source src="/video/space.mp4" type="video/mp4" />
                </Video>
                {mounted && (
                  <FortuneEnterButton
                    disabled={isEnded || roundData?.status !== RoundStatus.Open}
                    onClick={handleEnter}
                  />
                )}
              </Flex>
            </>
          )}
          <Flex
            direction="column"
            css={{
              gap: 10,
              backgroundColor: '$gray3',
              p: 20,
              position: 'fixed',
              bottom: 0,
              left: 0,
              width: '100%',
              '@md': {
                display: 'none'
              }
            }}>
            {mounted && (
              <Flex css={{ gap: 10 }}>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <FormatCryptoCurrency textStyle="h6" amount={totalPrize} />
                  <Text style="body4">Prize Pool</Text>
                </Flex>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <FormatCryptoCurrency textStyle="h6" amount={yourEntries} />
                  <Text style="body4">Your Entries</Text>
                </Flex>
                <Flex direction="column" css={{ flex: 0.5 }} >
                  <Text style="h6">{`${yourWinChance}%`}</Text>
                  <Text style="body4">Win Chance</Text>
                </Flex>
                <Flex align="start">
                  {roundData?.status === RoundStatus.Open && (
                    <Flex
                      align="center"
                      justify="center"
                      css={{
                        borderRadius: 6,
                        border: '1px solid $primary9',
                        minWidth: 75,
                        minHeight: 38,
                      }}
                    >
                      <Text style="h5">{`${convertedCountdown}`}</Text>
                    </Flex>
                  )}
                  {[RoundStatus.Drawing].includes(roundData?.status) && (
                    <Flex
                      align="center"
                      justify="center"
                      css={{
                        borderRadius: 6,
                        backgroundColor: 'primary',
                        minWidth: 75,
                        minHeight: 38,
                      }}
                    >
                      <LoadingSpinner css={{ width: 35, height: 35 }} />
                    </Flex>
                  )}

                  {[RoundStatus.Drawn, RoundStatus.None, RoundStatus.Cancelled].includes(roundData?.status) && (
                    <Flex
                      align="center"
                      justify="center"
                      css={{
                        borderRadius: 6,
                        backgroundColor: 'primary',
                        minWidth: 75,
                        minHeight: 38,
                      }}
                    />
                  )}
                </Flex>
              </Flex>
            )}
            {showEntryForm ? (
              <FortuneDepositModal
                roundId={roundData?.roundId}
                disabled={!roundData || !(parsedEthValue >= BigInt(roundData?.valuePerEntry || 0) || (Object.keys(selections)).length > 0)}
              />
            ) : (
              mounted ? (
                <FortuneEnterButton
                  disabled={isEnded || roundData?.status !== RoundStatus.Open}
                  onClick={handleEnter}
                />
              ) : null
            )}
          </Flex>
        </Box>
      </Box>
      <FortuneFooter />
      <Confetti ref={confettiRef} />
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

export const getStaticProps: GetStaticProps<{
  ssr: {
    round: Round
  }
  id: string | null
}> = async ({ params }) => {
  const id = params?.round?.toString() || null

  const response = await basicFetcher(`${process.env.NEXT_PUBLIC_HOST_URL}/api/subgraph/nftearth/fortune/api`,
    {
      method: 'POST',
      body: JSON.stringify({
        query: id ? `
          query GetRound($id: ID!) {
            round(id: $id) {
              id
              roundId
              status
              cutoffTime
              duration
              maximumNumberOfDeposits
              maximumNumberOfParticipants
              valuePerEntry
              numberOfEntries
              numberOfParticipants
              winner
              protocolFeeBp
              deposits(orderBy: indice, orderDirection: asc, first: 1000) {
                id
                depositor
                tokenAddress
                tokenAmount
                tokenId
                tokenType
                entriesCount
                indice
                claimed
                participant {
                  totalNumberOfEntries
                }
              }
            }
          }
        ` : `
          query GetCurrentRound {
            rounds(orderBy: roundId, orderDirection: desc, first: 1) {
              roundId
              status
              cutoffTime
              duration
              maximumNumberOfDeposits
              maximumNumberOfParticipants
              valuePerEntry
              numberOfEntries
              numberOfParticipants
              winner
              protocolFeeBp
              deposits(orderBy: indice, orderDirection: asc, first: 1000) {
                id
                depositor
                tokenAddress
                tokenAmount
                tokenId
                tokenType
                entriesCount
                indice
                claimed
                participant {
                  totalNumberOfEntries
                }
              }
            }
          }
        `,
        variables: {
          id
        }
      })
    }
  ).then(res => res.data)
    .catch(() => {})

  const round: Round = response?.data?.rounds?.[0] || response?.data?.round || null

  return {
    props: { ssr: { round }, id },
    revalidate: 30,
  }
}

export default FortunePage;
