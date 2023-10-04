import {FC, useCallback, useEffect, useMemo, useState} from "react";
import {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from "next";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import {formatUnits, parseUnits} from "ethers";
import {useAccount, useContractReads} from "wagmi";
import {ContractFunctionConfig, formatEther} from "viem";
import {arbitrum} from "viem/chains";
import {useRouter} from "next/router";
import {Abi} from "abitype";
import Link from "next/link";
import dayjs from "dayjs";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/bridge/NumericalInput";
import StakingTab from "components/staking/StakingTab";
import UnStakingTab from "components/staking/UnstakingTab";

import {useMounted} from "hooks";

import {OFT_CHAINS, OFTChain} from "utils/chains";
import {formatBN} from "utils/numbers";
import {roundToWeek} from "utils/round";

import NFTEOFTAbi from 'artifact/NFTEOFTAbi'
import xNFTEAbi from "artifact/xNFTEAbi";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";
import Decimal from "decimal.js-light";

const POOL_ADDRESS = '0x17ee09e7a2cc98b0b053b389a162fc86a67b9407'
export const MAX_LOCK_PERIOD_IN_DAYS = 365; // 1y
export const MIN_LOCK_PERIOD_IN_DAYS = 28;

type Props = InferGetStaticPropsType<typeof getStaticProps>

const StakingChainPage: FC<Props> = ({ ssr }) => {
  const [activeTab, setActiveTab] = useState('staking')
  const [valueEth, setValueEth] = useState<string>('0')
  const [duration, setDuration] = useState<string>('0')
  const [maxDuration, setMaxDuration] = useState<string>('12')
  const { address } = useAccount()
  const mounted = useMounted()
  const router = useRouter()
  const chain = ssr.chain || OFT_CHAINS[0]

  const addresses: Record<string, string> = {
    'NFTE': chain?.address as string,
    'xNFTE': chain?.xNFTE as string,
    'NFTE/WETH LP Token': chain?.LPNFTE as string,
  }

  const { data: nfteData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof NFTEOFTAbi, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof xNFTEAbi, 'locked', 'view'>,
    ]
    >({
    contracts: [
      // LPNFTE Balance
      {
        abi: NFTEOFTAbi,
        address: chain?.LPNFTE as `0x${string}`,
        chainId: arbitrum.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      },
      // xNFTE Locked
      {
        abi: xNFTEAbi,
        address: chain?.xNFTE as `0x${string}`,
        functionName: 'locked',
        chainId: arbitrum.id,
        args: [address as `0x${string}`],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const [nfteLPBalance, locked] = nfteData || []

  useEffect(() => {
    if (new Date((parseInt(`${locked?.result?.[1]}`) || 0) * 1000) > new Date()) {
      const timeStamp =  new Date(parseInt(`${locked?.result?.[1] || 0}`) * 1000);
      const roundedTime = dayjs(timeStamp).startOf('day')
      const oneYear = roundToWeek(dayjs().startOf('day').add(MAX_LOCK_PERIOD_IN_DAYS, 'days'))
      const daysLeft = oneYear.diff(roundedTime, 'days')
      setMaxDuration(`${Math.ceil(daysLeft / MIN_LOCK_PERIOD_IN_DAYS)}`)
    }
  }, [locked])

  const handleSetValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const handleSetDuration = (val: string) => {
    let newVal = parseInt(val)
    if (newVal < 0) {
      newVal = 0
    }

    if (newVal > +maxDuration) {
      newVal = +maxDuration
    }

    setDuration(`${newVal}`)
  }

  const handleSetMaxValue = useCallback(() => {
    const val = new Decimal(formatEther(BigInt(nfteLPBalance?.result || 0), 'wei'))
    setValueEth(`${val.toFixed()}`)
  }, [nfteLPBalance])

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <AlertChainSwitch chainId={chain?.id}/>
      <Flex
        direction="column"
        css={{
          mx: 20,
          pb: 80,
          '@md': {
            alignItems: 'center'
          }
        }}
      >
        <Flex
          css={{
            height: '1.25rem',
            mt: '1.75rem',
            mb: '1rem',
            gap: 10,
            mx: 16,
          }}
        >
          <Text
            style="subtitle1"
            css={{
              color: '$gray10'
            }}
            as={Link}
            href="/staking"
          >{`Stake`}</Text>
          <Text
            style="subtitle1"
            css={{
              color: '$gray10'
            }}
          >{`>`}</Text>
          <Text style="subtitle1">{`xNFTE ${ssr.chain?.name}`}</Text>
        </Flex>
        <Flex
          direction="column"
          css={{
            p: '1rem 1rem 0.75rem 1rem',
            border: '1px solid $gray4',
            background: '$gray3',
            px: 16,
            borderRadius: 8,
            '@md': {
              width: 400
            }
          }}
        >
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Text style="h6">Stake</Text>
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src={ssr.chain?.lightIconUrl} width={14} height={14}  alt={ssr.chain?.name}/>
              <Text style="body3" color="dark">{ssr.chain?.name}</Text>
            </Flex>
          </Flex>
          <Flex
            direction="column"
            css={{
              pt: 20
            }}
          >
            <Flex>
              <Button
                size="xs"
                color="ghost"
                onClick={() => {
                  setActiveTab('staking')
                }}
                css={{
                  px: 0,
                  mr: 30
                }}
              >Stake</Button>
              <Button
                size="xs"
                color="ghost"
                onClick={() => {
                  setActiveTab('unstaking')
                }}
                css={{
                  px: 0,
                  '&:disabled': {
                    backgroundColor: 'unset',
                    color: '$gray11',
                  },
                  '&:disabled:hover': {
                    backgroundColor: 'unset',
                    color: '$gray11',
                  },
                }}
                disabled
              >Unstake</Button>
            </Flex>
            <Flex
              direction="column"
              css={{
                gap: 20
              }}
            >
              <Flex
                direction="column"
                css={{
                  gap: 5,
                  mt: 20
                }}
              >
                <Flex
                  justify="between"
                >
                  <Text style="body3">Select Amount</Text>
                  <Text style="body3">{`NFTE/WETH LP Token Balance: ${formatBN(BigInt(nfteLPBalance?.result || 0), 4, 18 || 10)}`}</Text>
                </Flex>
                <Box
                  css={{
                    position: 'relative'
                  }}
                >
                  <NumericalInput
                    value={valueEth}
                    onUserInput={handleSetValue}
                    icon={<Button size="xs" onClick={handleSetMaxValue}>MAX</Button>}
                    iconStyles={{
                      top: 4,
                      right: 4,
                      left: 'auto'
                    }}
                    containerCss={{
                      width: '100%'
                    }}
                    css={{
                      pl: 40,
                      pr: 80,
                      boxShadow: '0 0 0 2px white'
                    }}
                  />
                  <CryptoCurrencyIcon
                    address={chain?.LPNFTE as `0x${string}`}
                    chainId={chain?.id}
                    css={{
                      position: 'absolute',
                      width: 25,
                      height: 25,
                      top: 10,
                      left: 10
                    }}
                  />
                </Box>
              </Flex>
              <Flex
                direction="column"
                css={{
                  gap: 5
                }}
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <Text style="body3">{+maxDuration < 1 ? 'You have locked for max duration' : `Stake Duration (${+maxDuration > 1 ? `1 to ${maxDuration}` : '1'}) months`}</Text>
                  <Tooltip
                    content={
                      <Text
                        style="body3"
                        as="p"
                        css={{
                          background: '#fff',
                          color: '#000',
                          margin: '-$2',
                          p: '$2',
                          maxWidth: 150
                        }}>
                        Unlock time is rounded to UTC weeks
                      </Text>
                    }
                  >
                    <FontAwesomeIcon icon={faCircleInfo} width={10} height={10}/>
                  </Tooltip>
                </Flex>
                <NumericalInput
                  value={duration}
                  disabled={+maxDuration < 1}
                  onUserInput={handleSetDuration}
                  min={0}
                  max={maxDuration}
                  step={1}
                  inputMode="numeric"
                  icon={<Button size="xs" onClick={() => setDuration(`${maxDuration}`)}>MAX</Button>}
                  iconStyles={{
                    top: 4,
                    right: 4,
                    left: 'auto'
                  }}
                  containerCss={{
                    width: '100%'
                  }}
                  css={{
                    pl: 10,
                    pr: 80,
                    boxShadow: '0 0 0 2px white'
                  }}
                />
              </Flex>
              {activeTab === "staking" && (
                <StakingTab
                  value={`${parseFloat(valueEth)}`}
                  duration={parseInt(duration)}
                  chain={chain}
                  depositor={{
                    id: address as `0x${string}`,
                    totalBalance: 0n,
                    lockedBalance: locked?.result?.[0],
                    lockEndTimestamp: locked?.result?.[1],
                  }}
                  onSuccess={() => {
                    setDuration('0')
                    setValueEth('0.0')
                    router.push('/staking')
                  }}
                />
              )}
              {activeTab === "unstaking" && (
                <UnStakingTab

                />
              )}
            </Flex>
          </Flex>
        </Flex>
        <AddressCollapsible
          addresses={addresses}
          chain={arbitrum}
        />
      </Flex>
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
    chain: OFTChain | null
  }
}> = async ({ params }) => {
  const chain = OFT_CHAINS.find(c => c.routePrefix === params?.chain) || null

  return {
    props: { ssr: { chain } },
    revalidate: 30,
  }
}

export default StakingChainPage;