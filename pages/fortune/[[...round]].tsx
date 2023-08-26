import {useCallback, useEffect, useRef, useState} from "react";
import {useCountdown} from 'usehooks-ts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faArrowLeft,
  faArrowRight,
  faForwardStep,
  faHistory,
  faVolumeMute,
  faVolumeUp,
} from "@fortawesome/free-solid-svg-icons";
import {useMediaQuery} from "react-responsive";
import Link from 'next/link'
import Image from 'next/image'

import Layout from 'components/Layout'
import {Head} from 'components/Head'
import Wheel from "components/fortune/Wheel";
import EntryForm from "components/fortune/EntryForm";
import Player, {PlayerType} from "components/fortune/Player";
import FortunePrize, {PrizeType} from "components/fortune/Prize";
import Confetti from "components/common/Confetti";
import ChainToggle from "components/common/ChainToggle";
import LoadingSpinner from "components/common/LoadingSpinner";
import {Box, Button, Flex, FormatCryptoCurrency, FormatCurrency, Text} from 'components/primitives'
import {useFortune, useMarketplaceChain, useMounted} from "hooks";
import supportedChains, {FORTUNE_CHAINS} from "utils/chains";
import {styled} from 'stitches.config'
import FortuneEnterButton from "../../components/fortune/EnterButton";
import {useAccount} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useRouter} from "next/router";
import useFortuneCurrentRound from "../../hooks/useFortuneCurrentRound";
import useFortuneRound, {Deposit, RoundStatus} from "../../hooks/useFortuneRound";
import {formatEther, parseEther} from "viem";

const Video = styled('video', {});

const convertTimer = (time: number) => {
  const mind = time % (60 * 60);
  const minutes = Math.floor(mind / 60);

  const secd = mind % 60;
  const seconds = Math.ceil(secd);

  return {
    minutes: String(minutes).padStart(2, '0'),
    seconds: String(seconds).padStart(2, '0')
  }
}

const getTitleText = (status: number, totalPrize: string, convertedCountdown: any) => {
  if (status === RoundStatus.Open) {
    return `${convertedCountdown.minutes}:${convertedCountdown.seconds} • Ξ${totalPrize} • Fortune | NFTEarth`
  }

  if (status === RoundStatus.Drawing) {
    return `Drawing Winner... • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  if (status === RoundStatus.Drawn) {
    return `Winner Drawn • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  return `Preparing Game... • Fortune  | NFTEarth`
}

const FortunePage = () => {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [playerWinner, setPlayerWinner] = useState<PlayerType>()
  const prizePotRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<any>(null);
  const router = useRouter()
  const { data: currentRound } = useFortuneCurrentRound({ refreshInterval: 5000 })
  const roundId = parseInt(router.query?.round as string) || currentRound?.roundId || 1
  const { data: rawRoundData } = useFortuneRound(roundId, { refreshInterval: 5000 })
  const { status: roundStatus = 0, valuePerEntry = 0, deposits = [], cutoffTime = 0, ...roundData } = rawRoundData || {};

  const [ showWinner, setShowWinner] = useState(false);
  const { setStatus } = useFortune<number>(q => q)
  const { data: usdConversion, setUSDConversion } = useFortune<number>(d => d.usdConversion)
  const { data: enableAudio, setEnableAudio } = useFortune<PrizeType[]>(d => d.enableAudio)
  const { data: prizes, setPrizes } = useFortune<PrizeType[]>(d => d.prizes)
  const { data: players, setPlayers } = useFortune<PlayerType[]>(d => d.players)
  const { data: durationLeft, setDurationLeft } = useFortune<number>(d => d.durationLeft)
  const { openConnectModal } = useConnectModal()
  const marketplaceChain = useMarketplaceChain()
  const { address } = useAccount()
  const mounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 })

  const [countdown, { startCountdown, resetCountdown }] = useCountdown({
    countStart: durationLeft < 0 ? 0 : durationLeft,
    countStop: 0,
    intervalMs: mounted ? 1000 : 0,
  })

  const convertedCountdown = convertTimer(countdown)

  useEffect(() => {
    setStatus?.(roundStatus || 0);
    const newPrizes: PrizeType[] = [];
    const newPlayers: PlayerType[] = [];

    (deposits || []).forEach((d: Deposit) => {
      const existingPlayer = newPlayers.find(p => p.address === d.depositor);

      if (!existingPlayer) {
        newPlayers.push({
          address: d.depositor as `0x${string}`,
          entry: d.numberOfEntries
        })
      }

      newPrizes.push({
        type: d.tokenType,
        depositor: d.depositor as `0x${string}`,
        address: d.tokenAddress as `0x${string}`,
        price: BigInt(0),
        amount: BigInt(d.tokenAmount),
        tokenId: BigInt(d.tokenId),
        totalNumberOfEntries: d.entry.totalNumberOfEntries
      })
    })

    setPrizes?.(newPrizes)
    setPlayers?.(newPlayers)

    const secondDiff = (+cutoffTime || 0) - ((new Date()).getTime() / 1000);
    setDurationLeft?.(secondDiff)
  }, [roundStatus, deposits, cutoffTime])

  const totalPrize = BigInt((roundData?.numberOfEntries || 0) * (valuePerEntry || 0))
  const yourEntries = prizes.filter(p => p.depositor === address)
    .reduce((a, b) => a + b.totalNumberOfEntries, 0) * (valuePerEntry || 0)
  const yourWinChance = Math.round((roundData?.numberOfEntries || 1) / (players.find(p => p.address === address)?.entry || 1))

  useEffect(() => {
    if (showWinner) {
      setShowWinner(false)
    }

    if (roundStatus === RoundStatus.Open) {
      resetCountdown()
      startCountdown()
      setPlayerWinner(undefined)
    } else {
      if (showEntryForm) {
        setShowEntryForm(false);
      }
    }
  }, [roundStatus])

  const handleEnter = useCallback((e: Event) => {
    e.preventDefault()

    if (!address) {
      return openConnectModal?.();
    }

    setShowEntryForm(true);
  }, [address])

  if (!mounted) {
    return null;
  }

  if (!FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id)) {
    return (
      <Layout>
        <Flex
          align="center"
          justify="center"
          direction="column"
          css={{
            height: 400,
            gap: 40
          }}
        >
          <Text style="h4">{`Fortune currently only supported on ${FORTUNE_CHAINS.map((chain) => {
            return supportedChains.find(c => c.id === chain.id)?.name || ''
          }).join(', ')}`}</Text>

          <ChainToggle/>
        </Flex>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head title={getTitleText(roundStatus, formatEther(totalPrize), convertedCountdown)}/>
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
            <Image src="/icons/fortune.png" width={40} height={40} objectFit="contain" alt="Fortune"/>
            <Text style="h4">Fortune</Text>
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
                      index={i}
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
                  <Text>{roundId === currentRound?.roundId ? `Current Round` : `Round ${roundId}`}</Text>
                  <Flex css={{ gap: 10 }}>
                    <Link href="/fortune/history" passHref legacyBehavior>
                      <Button as="a" size="xs" color="secondary">
                        <FontAwesomeIcon icon={faHistory} width={15} height={15}/>
                        {!isMobile && (<Text>History</Text>)}
                      </Button>
                    </Link>
                    <Link href={((roundId - 1) < 1) ? '/fortune' : `/fortune/${roundId - 1}`} legacyBehavior>
                      <Button size="xs" color="secondary" disabled={(roundId - 1) < 1}>
                        <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href={roundId === currentRound?.roundId ? '/fortune' : `/fortune/${roundId + 1}`} legacyBehavior>
                      <Button size="xs" color="secondary" disabled={roundId === currentRound?.roundId}>
                        <FontAwesomeIcon icon={faArrowRight} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href="/fortune" passHref legacyBehavior>
                      <Button as="a" size="xs" color="secondary">
                        <FontAwesomeIcon icon={faForwardStep} width={15} height={15}/>
                      </Button>
                    </Link>
                  </Flex>
                </Flex>
                <Flex
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
                      countdown={countdown}
                      onWheelEnd={(winnerIndex: number) => {
                        setPlayerWinner(players[winnerIndex])
                        setShowWinner(true);
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

                    <Flex
                      direction="column"
                      align="center"
                      css={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)'
                      }}
                    >
                      <Text css={{ borderBottom: '1px solid #ddd'}}>{`Round ${roundData?.roundId || 1}`}</Text>
                      <FormatCryptoCurrency textStyle="h3" logoHeight={35} amount={totalPrize} maximumFractionDigits={4} />
                      {roundStatus === RoundStatus.Open && (
                        <FormatCurrency amount={(totalPrize * BigInt(parseEther(`${usdConversion}`).toString())).toString()} />
                      )}
                      {[RoundStatus.Drawing].includes(roundStatus) && (
                        <Text style="subtitle1" css={{ color: '$primary10' }}>Drawing Winner...</Text>
                      )}
                      {showWinner && (
                        <Text style="subtitle1" css={{ color: '$primary10'}}>{`Winner is ${playerWinner?.name}`}</Text>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Flex justify="end">
                  <Button color="secondary" size="xs" onClick={() => {
                    setEnableAudio?.(!enableAudio)
                  }}>
                    <FontAwesomeIcon
                      icon={enableAudio ? faVolumeMute : faVolumeUp}
                      color={enableAudio ? 'red' : 'green'}
                      width={30}
                      height={30}
                    />
                  </Button>
                </Flex>
              </Flex>
            </>
          )}
          <EntryForm
            roundId={roundId}
            show={showEntryForm}
            lessThan30Seconds={countdown < 30}
            roundClosed={countdown < 1}
            onClose={() => setShowEntryForm(false)}
          />
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
              <Text style="h5">{`Round ${roundData?.roundId || 1}`}</Text>
              {roundStatus === RoundStatus.Open && (
                <Flex
                  align="center"
                  justify="center"
                  css={{
                    borderRadius: 6,
                    border: '1px solid $primary10',
                    minWidth: 75,
                    minHeight: 38,
                  }}
                >
                  <Text style="h5">{`${convertedCountdown.minutes}:${convertedCountdown.seconds}`}</Text>
                </Flex>
              )}
              {[RoundStatus.Drawing].includes(roundStatus) && (
                <Flex
                  align="center"
                  justify="center"
                  css={{
                    borderRadius: 6,
                    backgroundColor: '$primary1',
                    minWidth: 75,
                    minHeight: 38,
                  }}
                >
                  <LoadingSpinner css={{ width: 35, height: 35 }} />
                </Flex>
              )}

              {[RoundStatus.Drawn, RoundStatus.Cancelled, RoundStatus.None].includes(roundStatus) && (
                <Flex
                  align="center"
                  justify="center"
                  css={{
                    borderRadius: 6,
                    backgroundColor: '$primary1',
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
                <Text style="subtitle2">Your Win Chance</Text>
              </Flex>
            </Flex>
          </Flex>
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
                    <Button size="xs" color="secondary" onClick={() => {
                      if (prizePotRef.current) {
                        prizePotRef.current.scrollBy(-100, 0)
                      }
                    }}>
                      <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                    </Button>
                    <Button size="xs" color="secondary"  onClick={() => {
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
                    {prizes.map((prize, i: number) => (
                      <FortunePrize key={`prize-${i}`} data={prize} />
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
                <FortuneEnterButton
                  disabled={countdown < 1}
                  onClick={handleEnter}
                />
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
            <Flex css={{ gap: 10 }}>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <FormatCryptoCurrency textStyle="h6" amount={0.05} />
                <Text style="body3">Prize Pool</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <FormatCryptoCurrency textStyle="h6" amount={0.05} />
                <Text style="body3">Your Entries</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <Text style="h6">{`${yourWinChance}%`}</Text>
                <Text style="body3">Your Win Chance</Text>
              </Flex>
              <Flex align="start">
                {roundStatus === RoundStatus.Open && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      border: '1px solid $primary10',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  >
                    <Text style="h5">{`${convertedCountdown.minutes}:${convertedCountdown.seconds}`}</Text>
                  </Flex>
                )}
                {[RoundStatus.Drawing].includes(roundStatus) && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      backgroundColor: '$primary1',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  >
                    <LoadingSpinner css={{ width: 35, height: 35 }} />
                  </Flex>
                )}

                {[RoundStatus.Drawn, RoundStatus.None, RoundStatus.Cancelled].includes(roundStatus) && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      backgroundColor: '$primary1',
                      minWidth: 75,
                      minHeight: 38,
                    }}
                  />
                )}
              </Flex>
            </Flex>
            {showEntryForm ? (
              <Button
                css={{
                  justifyContent: 'center'
                }}
                onClick={(e) => {
                  e.preventDefault()
                }}
              >DEPOSIT</Button>
            ) : (
              <FortuneEnterButton
                onClick={handleEnter}
              />
            )}
          </Flex>
        </Box>
      </Box>
      <Confetti ref={confettiRef} />
    </Layout>
  )
}

export default FortunePage;