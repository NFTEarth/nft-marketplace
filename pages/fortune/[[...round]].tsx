import {useEffect, useMemo, useRef, useState} from "react";
import {useCountdown} from 'usehooks-ts'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'
import {
  faVolumeUp,
  faVolumeMute,
  faHistory,
  faArrowLeft,
  faArrowRight,
  faForwardStep,
} from "@fortawesome/free-solid-svg-icons";
import {useMediaQuery} from "react-responsive";
import Link from 'next/link'
import Image from 'next/image'

import Layout from 'components/Layout'
import { Head } from 'components/Head'
import Wheel from "components/fortune/Wheel";
import EntryForm from "components/fortune/EntryForm";
import Player, {PlayerType} from "components/fortune/Player";
import FortunePrize, {PrizeType} from "components/fortune/Prize";
import Confetti from "components/common/Confetti";
import ChainToggle from "components/common/ChainToggle";
import LoadingSpinner from "components/common/LoadingSpinner";
import {Box, Button, Flex, FormatCryptoCurrency, FormatCurrency, Text} from 'components/primitives'
import {useMounted, useFortune, useMarketplaceChain} from "hooks";
import supportedChains, {FORTUNE_CHAINS} from "utils/chains";
import { styled } from 'stitches.config'

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
  if (status === 0) {
    return `${convertedCountdown.minutes}:${convertedCountdown.seconds} • Ξ${totalPrize} • Fortune | NFTEarth`
  }

  if (status === 1) {
    return `Generating Random Number... • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  if (status === 2) {
    return `Drawing Winner... • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  if (status === 3) {
    return `Winner Drawn • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  return `Preparing Game... • Fortune  | NFTEarth`
}

const FortunePage = () => {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [winner, setWinner] = useState<PlayerType>()
  const prizePotRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<any>(null);

  const { data: status, setStatus } = useFortune<number>(d => d.status)
  const { data: enableAudio, setEnableAudio } = useFortune<PrizeType[]>(d => d.enableAudio)
  const { data: prizes, setPrizes } = useFortune<PrizeType[]>(d => d.prizes)
  const { data: players, setPlayers } = useFortune<PlayerType[]>(d => d.players)
  const { data: durationLeft, setDurationLeft } = useFortune<number>(d => d.durationLeft)

  const marketplaceChain = useMarketplaceChain()
  const mounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [countdown, { startCountdown, resetCountdown }] = useCountdown({
    countStart: durationLeft,
    countStop: 0,
    intervalMs: 1000,
  })

  const convertedCountdown = useMemo(() => convertTimer(countdown), [countdown])

  useEffect(() => {
    if (status === 0) {
      resetCountdown()
      startCountdown()
      setWinner(undefined)
    } else {
      setShowEntryForm(false);
    }

    if (status === 3) {
      setTimeout(() => {
        setStatus?.(0);
      }, 10 * 1000)
    }
  }, [status])


  useEffect(() => {
    if (countdown <= 0) {
      setStatus?.(1);
      setTimeout(() => {
        setStatus?.(2);
      }, 5000)
    }
  }, [countdown])

  if (!mounted) {
    return null;
  }

  const totalPrize = '0.03'

  if (!FORTUNE_CHAINS.includes(marketplaceChain.id)) {
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
          <Text style="h4">{`Fortune currently only supported on ${FORTUNE_CHAINS.map((chainId: number) => {
            return supportedChains.find(c => c.id === chainId)?.name || ''
          }).join(', ')}`}</Text>

          <ChainToggle/>
        </Flex>
      </Layout>
    )
  }

  return (
    <Layout>
      <Head title={getTitleText(status, totalPrize, convertedCountdown)}/>
      <Box
        css={{
          py: 24,
          px: '$6',
          height: '100%',
          pb: 160,
          '@md': {
            pb: 60,
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
                <Flex direction="column" css={{ gap: 5 }}>
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
                  <Text>Current Round</Text>
                  <Flex css={{ gap: 10 }}>
                    <Link href="/fortune/history" passHref legacyBehavior>
                      <Button as="a" size="xs" color="secondary">
                        <FontAwesomeIcon icon={faHistory} width={15} height={15}/>
                        {!isMobile && (<Text>History</Text>)}
                      </Button>
                    </Link>
                    <Link href="/fortune/1" passHref legacyBehavior>
                      <Button as="a" size="xs" color="secondary">
                        <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href="/fortune/3" passHref legacyBehavior>
                      <Button as="a" size="xs" color="secondary">
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
                        setWinner(players[winnerIndex])
                        setStatus?.(3)
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
                      <Text css={{ borderBottom: '1px solid #ddd'}}>Round 1</Text>
                      <FormatCryptoCurrency textStyle="h3" logoHeight={35} amount={0.0005} maximumFractionDigits={4} />
                      {status === 0 && (
                        <FormatCurrency amount={58.33} />
                      )}
                      {[1, 2].includes(status) && (
                        <Text style="subtitle1" css={{ color: '$primary10'}}>Drawing Winner...</Text>
                      )}
                      {status === 3 && (
                        <Text style="subtitle1" css={{ color: '$primary10'}}>{`Winner is ${winner?.name}`}</Text>
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
            show={showEntryForm}
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
              <Text style="h5">Round 1</Text>
              {status === 0 && (
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
              {[1,2].includes(status) && (
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

              {status === 3 && (
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
                <FormatCryptoCurrency textStyle="h5" amount={0.05} />
                <Text style="subtitle2">Prize Pool</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <Text style="h5">{`${players.length}/100`}</Text>
                <Text style="subtitle2">Players</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <FormatCryptoCurrency textStyle="h5" amount={0.05} />
                <Text style="subtitle2">Your Entries</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <Text style="h5">{`10%`}</Text>
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
                    transition: 'filter .5s',
                    '&:hover': {
                      filter: 'grayscale(1)'
                    }
                  }}
                >
                  <source src="/video/space.mp4" type="video/mp4" />
                </Video>
                <Button
                  disabled={status !== 0}
                  css={{
                    zIndex: 1
                  }}
                  onClick={(e) => {
                    e.preventDefault()
                    setShowEntryForm(true);
                  }}
                >ENTER NOW</Button>
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
                <Text style="h6">{`10%`}</Text>
                <Text style="body3">Your Win Chance</Text>
              </Flex>
              <Flex align="start">
                {status === 0 && (
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
                {[1,2].includes(status) && (
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

                {status === 3 && (
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
            <Button
              css={{
                justifyContent: 'center'
              }}
              onClick={(e) => {
                e.preventDefault()
                setShowEntryForm(true);
              }}
            >ENTER NOW</Button>
          </Flex>
        </Box>
      </Box>
      <Confetti ref={confettiRef} />
    </Layout>
  )
}

export default FortunePage;