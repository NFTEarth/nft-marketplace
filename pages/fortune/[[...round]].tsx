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
import {formatEther, formatUnits} from "viem";
import {truncateAddress} from "../../utils/truncate";
import {AddressZero} from "@ethersproject/constants"
import FortuneDepositModal from "../../components/fortune/DepositModal";
import {useCoinConversion} from "@reservoir0x/reservoir-kit-ui";
import {arbitrum} from "viem/chains";
import {Avatar} from "../../components/primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import {Simulate} from "react-dom/test-utils";
import play = Simulate.play;

type FortuneData = {
  enableAudio: boolean
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

const FortunePage = () => {
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [playerWinner, setPlayerWinner] = useState<PlayerType>()
  const prizePotRef = useRef<HTMLDivElement>(null);
  const [spinning, setSpinning] = useState(false);
  const confettiRef = useRef<any>(null);
  const router = useRouter()
  const { data: currentRound } = useFortuneCurrentRound({
    refreshInterval: 1000,
  })
  const { data: roundDataById } = useFortuneRound(parseInt(router.query?.round as string) || (currentRound as Round)?.roundId || 1, {
    refreshInterval: 5000,
    isPaused: () => !router.query?.round
  })

  const roundData = useMemo(() => {
    return router.query?.round ? roundDataById as Round : currentRound as Round
  }, [router, roundDataById, currentRound])
  const [ showWinner, setShowWinner] = useState(true);
  const { data: {
    players,
    enableAudio,
    usdConversion,
  }, setUSDConversion, setRound, setCountdown, setPlayers, setEnableAudio } = useFortune<FortuneData>(d => d)
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

  const secondDiff = (+roundData?.cutoffTime || 0) - ((new Date()).getTime() / 1000);
  const duration = secondDiff < 0 ? 0 : Math.round(secondDiff);

  const [countdown, { startCountdown, stopCountdown, resetCountdown }] = useCountdown({
    countStart: duration,
    countStop: 0,
    intervalMs: mounted ? 1000 : 0,
  })

  const convertedCountdown = convertTimer(countdown)

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
  const yourWinChance = currentPlayer ? Math.round((currentPlayer?.entry || 1) / (roundData?.numberOfEntries || 1) * 100) : 0
  const ethConversion =
    currencyToUsdConversions['ETH']
  const totalPrizeUsd =
    Number(formatUnits(BigInt(totalPrize), arbitrum.nativeCurrency.decimals || 18)) *
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
          price: BigInt(0),
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
    setRound?.(roundData)
  }, [roundData])

  useEffect(() => {
    setCountdown?.(countdown)
  }, [countdown])

  useEffect(() => {
    resetCountdown();
    startCountdown()

    setShowWinner(false)
    setPlayerWinner(undefined)

    if (roundData?.status === RoundStatus.Open) {
      startCountdown()
    } else {
      if (showEntryForm) {
        setShowEntryForm(false);
      }
    }
  }, [roundData?.status, roundData?.roundId])

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
      <Head title={getTitleText(roundData?.status, formatEther(totalPrize), convertedCountdown)}/>
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
                  <Text>{roundData?.roundId === currentRound?.roundId ? `Current Round` : `Round ${roundData?.roundId || '-'}`}</Text>
                  <Flex css={{ gap: 10 }}>
                    <Link href="/fortune/history" passHref legacyBehavior>
                      <Button as="a" size="xs" color="primary">
                        <FontAwesomeIcon icon={faHistory} width={15} height={15}/>
                        {!isMobile && (<Text>History</Text>)}
                      </Button>
                    </Link>
                    <Link href={((+roundData?.roundId - 1) < 1) ? '/fortune' : `/fortune/${+roundData?.roundId - 1}`} legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || (+roundData?.roundId - 1) < 1}>
                        <FontAwesomeIcon icon={faArrowLeft} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href={+roundData?.roundId === +(currentRound?.roundId || 1) ? '/fortune' : `/fortune/${+roundData?.roundId + 1}`} legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || !currentRound || +roundData?.roundId === +(currentRound?.roundId || 1)}>
                        <FontAwesomeIcon icon={faArrowRight} width={15} height={15}/>
                      </Button>
                    </Link>
                    <Link href="/fortune" legacyBehavior>
                      <Button size="xs" color="primary" disabled={!roundData?.roundId || !currentRound || +roundData?.roundId === +(currentRound?.roundId || 1)}>
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
                      countdown={countdown}
                      winner={roundData?.winner as `0x${string}`}
                      onWheelEnd={(winnerIndex: number) => {
                        setShowWinner(true);
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
                      {!showWinner && (
                        <Text css={{ borderBottom: '1px solid #ddd'}}>{`Round ${roundData?.roundId || '-'}`}</Text>
                      )}
                      {([RoundStatus.Open, RoundStatus.Drawing, RoundStatus.Drawn].includes(roundData?.status) && !showWinner) && (
                        <FormatCryptoCurrency textStyle="h3" logoHeight={35} amount={totalPrize} maximumFractionDigits={4} />
                      )}
                      {roundData?.status === RoundStatus.Open && (
                        <FormatCurrency amount={totalPrizeUsd} />
                      )}
                      {(roundData?.status === RoundStatus.Open && countdown < 1) && (
                        <Text style="subtitle1" css={{ color: 'primary' }}>Processing...</Text>
                      )}
                      {[RoundStatus.Drawing].includes(roundData?.status) && (
                        <Text style="subtitle1" css={{ color: 'primary' }}>Drawing Winner...</Text>
                      )}
                      {roundData?.status === RoundStatus.Cancelled && (
                        <Text style="h5" css={{ color: 'primary', mt: 20 }}>Round Cancelled</Text>
                      )}
                      {showWinner && (
                        <Flex
                          direction="column"
                          align="center"
                          css={{
                            mt: -40
                          }}
                        >
                          <Flex
                            css={{
                              backgroundImage: 'url(/images/winner-bg.png)',
                              backgroundSize: 'contain',
                              backgroundPosition: 'center',
                              backgroundRepeat: 'no-repeat',
                              p: 40
                            }}
                          >
                            {playerWinner?.ensAvatar ? (
                              <Avatar size="xl" src={playerWinner?.ensAvatar} />
                            ) : (
                              <Jazzicon diameter={56} seed={jsNumberForAddress(playerWinner?.address || '' as string)} />
                            )}
                          </Flex>
                          <Text
                            style="h4"
                            css={{
                              color: 'primary',
                              background: 'linear-gradient(rgb(248, 204, 50) 0%, rgb(248, 204, 50) 50%, rgb(255, 138, 20) 100%)',
                              '-webkit-text-fill-color': 'transparent',
                              '-webkit-background-clip': 'text'
                            }}>
                            {
                              playerWinner?.shortEnsName ||
                              playerWinner?.shortAddress ||
                              truncateAddress(playerWinner?.address || '')
                            }
                          </Text>
                          <Flex css={{ gap: 20 }}>
                            <FormatCryptoCurrency textStyle="subtitle1" logoHeight={15} amount={totalPrize} maximumFractionDigits={2} />
                            <Text style="subtitle1">{`${((roundData?.numberOfEntries || 1) / (playerWinner?.entry || 0)).toFixed(1)}x WIN`}</Text>
                          </Flex>
                        </Flex>
                      )}
                    </Flex>
                  </Box>
                </Flex>
                <Flex justify="end">
                  <Button color="primary" size="xs" onClick={() => {
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
            roundId={roundData?.roundId}
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
              <Text style="h5">{`Round ${roundData?.roundId || '-'}`}</Text>
              {roundData?.status === RoundStatus.Open && (
                <Flex
                  align="center"
                  justify="center"
                  css={{
                    borderRadius: 6,
                    border: '1px solid primary',
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
                <Text style="subtitle2">Your Percentage Chance Of Winning</Text>
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
                    {prizes.map((prize, i: number) => (
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
                  disabled={countdown < 1 || roundData?.status !== RoundStatus.Open}
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
                <Text style="body3">Your Percentage Chance Of Winning</Text>
              </Flex>
              <Flex align="start">
                {roundData?.status === RoundStatus.Open && (
                  <Flex
                    align="center"
                    justify="center"
                    css={{
                      borderRadius: 6,
                      border: '1px solid primary',
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
            {showEntryForm ? (
              <FortuneDepositModal roundId={roundData?.roundId} />
            ) : (
              <FortuneEnterButton
                disabled={countdown < 1 || roundData?.status !== RoundStatus.Open}
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
