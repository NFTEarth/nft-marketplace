import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useCountdown} from 'usehooks-ts'
import useSound from 'use-sound'
import {parseEther} from "ethers/lib/utils";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faVolumeUp,
  faVolumeMute,
  faHistory,
  faArrowLeft,
  faArrowRight,
  faForwardStep
} from "@fortawesome/free-solid-svg-icons";
import { CreateTypes } from 'canvas-confetti'
import ReactCanvasConfetti from 'react-canvas-confetti'

import Layout from 'components/Layout'
import Wheel from "components/fortune/Wheel";
import {Box, Button, Flex, FormatCryptoCurrency, FormatCurrency, Text} from 'components/primitives'
import Player, {PlayerType} from "components/fortune/Player";
import LoadingSpinner from "components/common/LoadingSpinner";
import {useMounted} from "hooks";
import Link from "next/link";
import {useMediaQuery} from "react-responsive";
import FortunePrize, {PrizeType} from "../../components/fortune/Prize";
import {AddressZero} from "@ethersproject/constants";

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

const spinWheelAudioSpriteMap = {
  start: [0, 1200, true],
  end: [1200, 1000, false]
} as any;

const fortunePrizes: PrizeType[] = [
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },{
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },{
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  },
  {
    type: 'erc20',
    bidderName: 'ryuzaki01.eth',
    address: AddressZero,
    price: BigInt(parseEther('0.01').toString())
  }
]

const FortunePage = () => {
  const [status, setStatus] = useState(0)
  const [enableAudio, setEnableAudio] = useState(false)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const refAnimationInstance = useRef<CreateTypes | null>();
  const prizePotRef = useRef<HTMLDivElement>(null);
  const [playWin] = useSound(`${process.env.NEXT_PUBLIC_HOST_URL}/audio/win.mp3`, {
    interrupt: true
  })
  const [playStart] = useSound(`${process.env.NEXT_PUBLIC_HOST_URL}/audio/game-start.mp3`, {
    interrupt: true
  })
  const [playWheel, { stop: stopAudio }] = useSound(`${process.env.NEXT_PUBLIC_HOST_URL}/audio/wheel-spin.mp3`, {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true
  })

  const mounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 })
  const [players, setPlayers] = useState<PlayerType[]>([
    {
      y: 30,
      name: "Ryuzaki01",
      color: '#04cd58',
      address: '0x7D3E5dD617EAF4A3d42EA550C41097086605c4aF',
      entry: BigInt(parseEther('0.001').toString())
    },
    {
      y: 20,
      name: "Weston",
      color: '#2c51ff',
      address: '0xafd86179acd9a441801a5e582410e7e04e992d4a',
      entry: BigInt(parseEther('0.005').toString())
    }
  ]);
  const [countdown, { startCountdown, resetCountdown }] = useCountdown({
    countStart: 60 * 5,
    countStop: 0,
    intervalMs: 1000,
  })

  const convertedCountdown = useMemo(() => convertTimer(countdown), [countdown])

  const makeShot = useCallback((particleRatio: number, opts: any) => {
    refAnimationInstance.current &&
    refAnimationInstance.current({
      ...opts,
      origin: { y: 0.7 },
      particleCount: Math.floor(200 * particleRatio)
    });
  }, [refAnimationInstance]);

  const fireConfetti = useCallback(() => {
    makeShot(0.35, {
      spread: 46,
      startVelocity: 55
    });

    makeShot(0.3, {
      spread: 60
    });

    makeShot(0.45, {
      spread: 100,
      decay: 0.91,
      scalar: 0.8
    });

    makeShot(0.2, {
      spread: 150,
      startVelocity: 25,
      decay: 0.92,
      scalar: 1.2
    });

    makeShot(0.2, {
      spread: 220,
      startVelocity: 45
    });
  }, [makeShot]);

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (status === 0) {
      playStart?.()
    }

    if (status === 1) {
      playWheel?.({ id: 'start' })
    }

    if (status === 2) {
      stopAudio?.('start')
      playWheel?.({ id: 'end' })
    }

    if (status === 3) {
      playWin?.()
      fireConfetti?.()
    }
  }, [status, enableAudio])

  useEffect(() => {
    if (status === 0) {
      resetCountdown()
      startCountdown()
    }

    if (status === 3) {
      setTimeout(() => {
        setStatus(0);
      }, 10 * 1000)
    }
  }, [status])

  useEffect(() => {
    if (countdown <= 0) {
      setStatus(1);
      setTimeout(() => {
        setStatus(2);
      }, 5000)
    }
  }, [countdown])

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex justify="center">
          <Text style="h2">Fortune</Text>
        </Flex>
        <Box css={{
          gap: 30,
          display: 'grid',
          gridTemplateAreas: '"main" "player" "stat" "pot" "cta"',
          gridTemplateColumns: '100%',
          '@md': {
            gridTemplateAreas: '"main stat" "main cta" "player cta" "player cta" "pot pot"',
            gridTemplateColumns: '60% 40%',
          },
          '@lg': {
            gridTemplateAreas: '"player main main stat" "player main main cta" "player main main cta" "pot pot pot cta"',
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
                    <Player key={`player-${i}`} data={p} />
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
                  gridArea: 'main'
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
                      status={status}
                      countdown={countdown}
                      players={players}
                      onWheelEnd={() => {
                        setStatus(3)
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
                        <Text style="subtitle1" css={{ color: '$primary10'}}>Winner is ...</Text>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Flex justify="end">
                  <Button color="secondary" size="xs" onClick={() => {
                    setEnableAudio(!enableAudio)
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
          {showEntryForm && (
            <Flex
              direction="column"
              css={{
                gridArea: 'main',
                overflow: 'hidden',
              }}
            >

            </Flex>
          )}
          <Flex
            direction="column"
            justify="center"
            css={{
              borderRadius: 10,
              backgroundColor: '$gray3',
              p: '$4',
              gap: 20,
              gridArea: 'stat'
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
                    {fortunePrizes.map((prize, i: number) => (
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
                  gridArea: 'cta'
                }}>
                <Button onClick={(e) => {
                  e.preventDefault()
                  setShowEntryForm(true);
                }}>ENTER NOW</Button>
              </Flex>
            </>
          )}
        </Box>
      </Box>
      <ReactCanvasConfetti
        refConfetti={(instance) => {
          refAnimationInstance.current = instance;
        }}
        style={{
          position: "fixed",
          pointerEvents: "none",
          width: "100%",
          height: "100%",
          top: 0,
          left: 0,
          zIndex: 100000,
        }} />
    </Layout>
  )
}

export default FortunePage;