import {FC, useCallback, useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import {useAccount, useContractReads} from "wagmi";
import {ContractFunctionConfig, formatEther} from "viem";
import {useRouter} from "next/router";
import Link from "next/link";
import dayjs from "dayjs";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/common/NumericalInput";
import StakingTab from "components/staking/StakingTab";
import UnStakingTab from "components/staking/UnstakingTab";

import {useMarketplaceChain, useMounted} from "hooks";

import {formatBN} from "utils/numbers";

import NFTEOFTAbi from "artifact/NFTEOFTAbi";
import veNFTEAbi from "artifact/veNFTEAbi";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";
import Decimal from "decimal.js-light";
import {NFTEOFT, NFTE_LP, VE_NFTE } from "../../utils/contracts";
import { base } from "utils/chains";
import { parseUnits } from "viem";

export const MAX_LOCK_PERIOD_IN_DAYS = 365; // 1y
export const MIN_LOCK_PERIOD_IN_DAYS = 7; // 1w

const StakingChainPage: FC = () => {
  const chain = useMarketplaceChain()
  const [activeTab, setActiveTab] = useState('staking')
  const [valueEth, setValueEth] = useState<string>('0')
  const [duration, setDuration] = useState<string>('0')
  const [maxDuration, setMaxDuration] = useState<string>('52')
  const [enableUnStake, setEnableUnStake] = useState<boolean>(false)
  const { address } = useAccount()
  const mounted = useMounted()
  const router = useRouter()

  const addresses: Record<string, string> = {
    'NFTE': NFTEOFT,
    'NFTE/WETH LP Token': NFTE_LP,
    'veNFTE': VE_NFTE,
  }

  const { data: nfteoftData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof NFTEOFTAbi, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof veNFTEAbi, 'locked', 'view'>,
    ]
    >({
    contracts: [
      // LPNFTE Balance
      {
        abi: NFTEOFTAbi,
        address: NFTE_LP,
        chainId: base.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      },
      // veNFTE Locked
      {
        abi: veNFTEAbi,
        address: VE_NFTE,
        functionName: 'locked',
        chainId: base.id,
        args: [address as `0x${string}`],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const [nfteLPBalance, locked] = nfteoftData || []

  useEffect(() => {
    if (new Date((parseInt(`${locked?.result?.[1]}`) || 0) * 1000) > new Date()) {
      const timeStamp =  new Date(parseInt(`${locked?.result?.[1] || 0}`) * 1000);
      const roundedTime = dayjs(timeStamp).startOf('day')
      const oneYear = dayjs().startOf('day').add(MAX_LOCK_PERIOD_IN_DAYS, 'days')
      const daysLeft = oneYear.diff(roundedTime, 'days')
      setMaxDuration(`${Math.ceil(daysLeft / MIN_LOCK_PERIOD_IN_DAYS)}`)
      setEnableUnStake(parseInt(`${locked?.result?.[1] || 0}`) * 1000 < (new Date()).getTime())
    }
  }, [locked])

  const handleSetValue = (val: string) => {
    try {
      const numVal = Number(val);
      parseUnits(`${numVal}`, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  };
  

  function handleSetDuration(val: string) {
        let newVal = parseInt(val);
        if (newVal < 0) {
            newVal = 0
        }

        if (newVal > +maxDuration) {
            newVal = +maxDuration;
        }

        setDuration(`${newVal}`);
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
      <AlertChainSwitch chainId={base.id}/>
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
          <Text style="subtitle1">{`veNFTE ${chain.name}`}</Text>
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
              <img src={chain?.lightIconUrl} width={14} height={14}  alt={chain?.name}/>
              <Text style="body3" color="dark">{chain?.name}</Text>
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
                disabled={!enableUnStake}
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
              >Unstake</Button>
            </Flex>
            <Flex
              direction="column"
              css={{
                gap: 20
              }}
            >
              {activeTab === "staking" && (
                <>
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
                      <Text style="body3">{`NFTE/WETH LP Balance: ${formatBN(BigInt(nfteLPBalance?.result || 0), 4, 18 || 10)}`}</Text>
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
                        address={NFTE_LP}
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
                      <Text style="body3">{+maxDuration < 1 ? 'You have locked for max duration' : `Stake Duration (${+maxDuration > 1 ? `1 to ${maxDuration}` : '1'}) weeks`}</Text>
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
                  <StakingTab
                    value={`${parseFloat(valueEth)}`}
                    duration={parseInt(duration)}
                    chain={base}
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
                </>
              )}
              {activeTab === "unstaking" && (
                <UnStakingTab
                  onSuccess={() => {
                    router.push('/staking')
                  }}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
        <AddressCollapsible
          addresses={addresses}
          chain={base}
        />
      </Flex>
    </Layout>
  )
}

export default StakingChainPage;