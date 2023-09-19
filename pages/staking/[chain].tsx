import {FC, useMemo, useState} from "react";
import {GetStaticPaths, GetStaticProps, InferGetStaticPropsType} from "next";
import {basicFetcher} from "utils/fetcher";
import {OFT_CHAINS, OFTChain} from "utils/chains";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import Layout from "../../components/Layout";
import Link from "next/link";
import NumericalInput from "../../components/bridge/NumericalInput";
import {formatUnits, parseUnits} from "ethers";
import {useAccount, useContractReads, useNetwork, useWalletClient} from "wagmi";
import {ContractFunctionConfig, parseEther} from "viem";
import {arbitrum} from "viem/chains";
import NFTEOFTAbi from 'artifact/NFTEOFTAbi.json'
import {Abi} from "abitype";
import {formatBN} from "../../utils/numbers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import StakingTab from "../../components/staking/StakingTab";
import UnStakingTab from "../../components/staking/UnstakingTab";

const NFTEOFT = NFTEOFTAbi as Abi

type Props = InferGetStaticPropsType<typeof getStaticProps>

const APY = 78.45
const StakingChainPage: FC<Props> = ({ ssr }) => {
  const [activeTab, setActiveTab] = useState('staking')
  const [valueEth, setValueEth] = useState<string>('0.0')
  const [duration, setDuration] = useState<string>('0')

  const chain = ssr.chain

  const { address } = useAccount()

  const { data: nfteData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'totalSupply', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'totalSupply', 'view'>
    ]
    >({
    contracts: [
      // LPNFTE Balance
      {
        abi: NFTEOFT,
        address: chain?.LPNFTE as `0x${string}`,
        chainId: arbitrum.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      }
    ],
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const handleSetValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const [nfteLPBalance] = useMemo(() => {
    return nfteData || []
  }, [nfteData])

  const handleSetMaxValue = () => {
    const val = formatUnits(nfteLPBalance?.result, 18)
    setValueEth(val)
  }

  return (
    <Layout>
      <Flex
        direction="column"
        css={{
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
          <Text style="subtitle1">{`NFTE${ssr.chain?.name}`}</Text>
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
                css={{
                  px: 0,
                  mr: 30
                }}
              >Stake</Button>
              <Button
                size="xs"
                color="ghost"
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
                  <Text style="body3">{`Balance : ${formatBN(nfteLPBalance?.result?.toString() || 0, 4, 18 || 10)}`}</Text>
                </Flex>
                <Box
                  css={{
                    position: 'relative'
                  }}
                >
                  <NumericalInput
                    value={valueEth}
                    onUserInput={handleSetValue}
                    icon={<Button size="xs" onClick={() => handleSetMaxValue()}>MAX</Button>}
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
                      boxShadow: 'inset 0 0 0 2px $$focusColor'
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
                  <Text style="body3">Stake Duration (1 to 36 months)</Text>
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
                  onUserInput={setDuration}
                  min={1}
                  max={12}
                  step={1}
                  icon={<Button size="xs" onClick={() => setDuration('12')}>MAX</Button>}
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
                    boxShadow: 'inset 0 0 0 2px $$focusColor',
                  }}
                />
              </Flex>
              {activeTab === "staking" && (
                <StakingTab
                  APY={APY}
                  value={valueEth}
                  duration={parseInt(duration)}
                  chain={chain}
                />
              )}
              {activeTab === "unstaking" && (
                <UnStakingTab

                />
              )}
            </Flex>
          </Flex>
        </Flex>
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