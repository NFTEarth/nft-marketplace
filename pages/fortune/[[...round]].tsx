import {useCallback, useEffect, useMemo, useRef, useState} from "react";
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
import useFortuneRound, {Deposit, Round, RoundStatus} from "../../hooks/useFortuneRound";
import {formatEther, parseEther} from "viem";
import {truncateAddress} from "../../utils/truncate";
import {AddressZero} from "@ethersproject/constants"
import FortuneDepositModal from "../../components/fortune/DepositModal";
import useSound from "../../hooks/useSound";

type FortuneData = {
  players: PlayerType[]
  usdConversion: number
  durationLeft: number
}

const Video = styled('video', {});

const convertTimer = (time: number) : string => {
  const mind = time % (60 * 60);
  const minutes = Math.floor(mind / 60);

  const secd = mind % 60;
  const seconds = Math.ceil(secd);

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

const getTitleText = (status: number, totalPrize: string, convertedCountdown: any) => {
  if (status === RoundStatus.Open) {
    return `${convertedCountdown} • Ξ${totalPrize} • Fortune | NFTEarth`
  }

  if (status === RoundStatus.Drawing) {
    return `Drawing Winner... • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  if (status === RoundStatus.Drawn) {
    return `Winner Drawn • Ξ${totalPrize} • Fortune  | NFTEarth`
  }

  return `Preparing Game... • Fortune  | NFTEarth`
}

const spinWheelAudioSpriteMap = {
  start: [0, 1200, true],
  end: [500, 2000, false]
} as any;


const FortunePage = () => {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [playerWinner, setPlayerWinner] = useState<PlayerType>()
  const prizePotRef = useRef<HTMLDivElement>(null);
  const confettiRef = useRef<any>(null);
  const router = useRouter()
  const { data: currentRound } = useFortuneCurrentRound({
    refreshInterval: 1000,
  })
  const { data: roundDataById } = useFortuneRound(parseInt(router.query?.round as string) || (currentRound as Round)?.roundId || 1, {
    refreshInterval: 5000,
    isPaused: () => !router.query?.round
  })

  const rawRoundData = useMemo(() => {
    return router.query?.round ? roundDataById as Round : currentRound as Round
  }, [router, roundDataById, currentRound])

  const { roundId, status: roundStatus = 0, valuePerEntry = 0, deposits = [], cutoffTime = 0, ...roundData } = rawRoundData || {}

  const [ showWinner, setShowWinner] = useState(false);
  const { data: {
    players,
    usdConversion,
    durationLeft
  }, setUSDConversion, setDurationLeft, setCountdown, setPlayers, setStatus } = useFortune<FortuneData>(d => d)
  const [ enableAudio, setEnableAudio ] = useState(false)
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

  const [countdown, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: durationLeft < 0 ? 0 : durationLeft,
    countStop: 0,
    intervalMs: mounted ? 1000 : 0,
  })

  const convertedCountdown = convertTimer(countdown)

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

    (deposits || []).forEach((d: Deposit) => {
      const winChance = Math.round(d.numberOfEntries / (roundData?.numberOfEntries || 1) * 100)
      const colorHash = Math.floor(+d.depositor*16777215).toString(16)
      const player: PlayerType = {
        index: newPlayers.length,
        address: d.depositor as `0x${string}`,
        entry: d.numberOfEntries,
        y: winChance,
        color: `#${colorHash.substring(0, 2)}${colorHash.substring(8, 10)}${colorHash.substring(16, 18)}`
      };

      newPlayers.push(player)

      if (d.tokenType === 'ETH') {
        newPrizes = newPrizes.map((p, i) => {
          if (i === 0) {
            p.depositors.push({
              player,
              amount: BigInt(d.tokenAmount)
            });
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
              p.depositors.push({
                player,
                amount: BigInt(d.tokenAmount)
              });
              p.amount = p.amount + BigInt(d.tokenAmount)
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
            totalNumberOfEntries: BigInt(d.entry.totalNumberOfEntries)
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
          price: BigInt(0),
          amount: BigInt(d.tokenAmount),
          tokenId: BigInt(d.tokenId),
          totalNumberOfEntries: BigInt(d.entry.totalNumberOfEntries)
        })
      }
    })

    setPrizes(newPrizes)
    setPlayers?.({
      type: 'set',
      payload: newPlayers
    })
  }, [deposits])

  useEffect(() => {
    setStatus?.(roundStatus || 0);
  }, [roundStatus])

  useEffect(() => {
    const secondDiff = (+cutoffTime || 0) - ((new Date()).getTime() / 1000);
    setDurationLeft?.(Math.round(secondDiff))
  }, [cutoffTime])

  useEffect(() => {
    setCountdown?.(countdown)
  }, [countdown])

  const totalPrize =(BigInt(roundData?.numberOfEntries || 0) || BigInt(0)) * (BigInt(valuePerEntry) || BigInt(0))
  const yourEntries = BigInt(deposits.filter(p => (new RegExp(address as string, 'i').test(p.depositor as string)))
    .reduce((a, b) => a + BigInt(b.entry.totalNumberOfEntries || 0), BigInt(0)) * (BigInt(valuePerEntry) || BigInt(0)))
  const currentPlayer = players.find(p => (new RegExp(address as string, 'i')).test(p.address));
  const yourWinChance = currentPlayer ? Math.round((currentPlayer?.entry || 1) / (roundData?.numberOfEntries || 1) * 100) : 0


  const [playStart] = useSound([
    `/audio/game-start.webm`,
    `/audio/game-start.mp3`
  ], {
    interrupt: true,
    volume: 0.8
  })
  const [playWheel, { stop: stopAudio, sound: wheelSound }] = useSound([
    `/audio/wheel-spin.webm`,
    `/audio/wheel-spin.mp3`
  ], {
    sprite: spinWheelAudioSpriteMap,
    interrupt: true,
    volume: 0.8
  })

  useEffect(() => {
    if (!enableAudio) {
      return;
    }

    if (roundStatus === RoundStatus.Open) {
      playStart?.()
    }

    if (roundStatus === RoundStatus.Drawing) {
      playWheel?.({ id: 'start' })
    }

    if (roundStatus === RoundStatus.Drawn) {
      console.log('Play Wheel end')
      stopAudio?.('start')
      playWheel?.({ id: 'end' })
    }
  }, [roundStatus, enableAudio, roundId])

  useEffect(() => {
    if (showWinner) {
      setShowWinner(false)
    }

    if (roundStatus === RoundStatus.Open) {
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
                    <Link href={((+roundId - 1) < 1) ? '/fortune' : `/fortune/${+roundId - 1}`} legacyBehavior>
                      <Button size="xs" color="secondary" disabled={!roundId || (+roundId - 1) < 1}>
                        <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href={+roundId === +(currentRound?.roundId || 1) ? '/fortune' : `/fortune/${+roundId + 1}`} legacyBehavior>
                      <Button size="xs" color="secondary" disabled={!roundId || !currentRound || +roundId === +(currentRound?.roundId || 1)}>
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
                      roundId={roundId}
                      winner={roundData?.winner as `0x${string}`}
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
                      <Text css={{ borderBottom: '1px solid #ddd'}}>{`Round ${roundId || 1}`}</Text>
                      <FormatCryptoCurrency textStyle="h3" logoHeight={35} amount={totalPrize} maximumFractionDigits={4} />
                      {roundStatus === RoundStatus.Open && (
                        <FormatCurrency amount={(totalPrize * BigInt(parseEther(`${usdConversion}`).toString())).toString()} />
                      )}
                      {(roundStatus === RoundStatus.Open && countdown < 1) && (
                        <Text style="subtitle1" css={{ color: '$primary10' }}>Processing...</Text>
                      )}
                      {[RoundStatus.Drawing].includes(roundStatus) && (
                        <Text style="subtitle1" css={{ color: '$primary10' }}>Drawing Winner...</Text>
                      )}
                      {showWinner && (
                        <Text style="subtitle1" css={{ color: '$primary10'}}>{`Winner is ${playerWinner?.name || truncateAddress(playerWinner?.address || '')}`}</Text>
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
              <Text style="h5">{`Round ${roundId || 1}`}</Text>
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
                  <Text style="h5">{`${convertedCountdown}`}</Text>
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
                  disabled={countdown < 1 || roundStatus !== RoundStatus.Open}
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
                <FormatCryptoCurrency textStyle="h6" amount={totalPrize} />
                <Text style="body3">Prize Pool</Text>
              </Flex>
              <Flex direction="column" css={{ flex: 0.5 }} >
                <FormatCryptoCurrency textStyle="h6" amount={yourEntries} />
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
                    <Text style="h5">{`${convertedCountdown}`}</Text>
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
              <FortuneDepositModal roundId={roundId} />
            ) : (
              <FortuneEnterButton
                disabled={countdown < 1 || roundStatus !== RoundStatus.Open}
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