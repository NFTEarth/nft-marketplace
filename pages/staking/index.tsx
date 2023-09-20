import {useMemo, useState} from "react";
import {
  useAccount,
  useContractReads,
} from "wagmi";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock} from "@fortawesome/free-solid-svg-icons";
import {ContractFunctionConfig, formatEther, zeroAddress} from "viem";
import {Abi} from "abitype";
import {arbitrum} from "viem/chains";
import Link from "next/link";

import Layout from "components/Layout";
import {Footer} from "components/Footer";
import {
  Box,
  Button,
  Flex,
  Text,
  CryptoCurrencyIcon,
  FormatCrypto,
  FormatCryptoCurrency
} from "components/primitives";
import StakingList from "components/staking/StakingList";
import StakeList from "components/staking/StakeList";
import ClaimList from "components/staking/ClaimList";

import {useMounted, useStakingDepositor, useStakingLP} from "hooks";

import {OFT_CHAINS} from "utils/chains";
import {formatBN} from "utils/numbers";

import NFTEOFTAbi from 'artifact/NFTEOFTAbi.json'

const StakingPage = () => {
  const chain = OFT_CHAINS.find((chain) => chain.id === arbitrum.id)
  const isMounted = useMounted()
  const [activeTab, setActiveTab] = useState('stakes')
  const { address } = useAccount()
  const { data: depositor } = useStakingDepositor(address, { refreshInterval: 5000 })
  const { data: lp } = useStakingLP(chain?.LPNFTE, { refreshInterval: 5000 })
  const NFTEOFT = NFTEOFTAbi as Abi

  const { data: nfteData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'totalSupply', 'view'>,
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
      },
      // xNFTE Balance
      {
        abi: NFTEOFT,
        address: chain?.xNFTE as `0x${string}`,
        chainId: arbitrum.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi: NFTEOFT,
        address: chain?.xNFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: arbitrum.id,
        args: [],
      }
    ],
    watch: false,
    staleTime: 1000 * 60,
    allowFailure: true,
    enabled: !!address,
  })

  const [nfteLPBalance, xNfteBalance, totalSupplyXNfte] = nfteData || []

  const stakingTitle = useMemo(() => {
    const APY = '78.45';

    if (nfteLPBalance?.result === 0n) {
      return (
        <Text css={{ maxWidth: '75%' }}>
        Get NFTE LP tokens from{' '}
        <a
          href="https://app.gamma.xyz/vault/uni/arbitrum/details/nfte-weth-10000-wide"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'red' }}  // This line sets the color to red
        >
          Gamma Strategies
        </a>{' '}
        to stake and receive xNFTE. xNFTE holders control protocol governance and earn all revenue sharing from the DAO. NFTEarth is governed entirely by xNFTE holders.
      </Text>
      )
    }

    return (
      <Text style="h4">
        {`You have `}
        <Text style="h4" color="primary">
          {`${formatBN(xNfteBalance?.result || 0n, 2, 18, {})} xNFTE`}
        </Text>
        {` and `}
        <Text style="h4" color="primary">
          {`${formatBN(nfteLPBalance?.result || 0n, 2, 18, {})} LP NFTE`}
        </Text>
        {` available to stake at `}
        <Text style="h4" color="primary">
          {`${APY}% APY`}
        </Text>
        .
      </Text>
    );

  }, [nfteLPBalance, xNfteBalance, totalSupplyXNfte])

  const stakedPercent = useMemo(() => {
    return (+formatEther(lp?.totalStaked || 0n) / +formatEther(lp?.totalSupply || 1n)) * 100
  }, [lp])

  if (!isMounted) {
    return null;
  }

  return (
    <Layout>
      <Box
        css={{
          height: '100%',
          width: 'calc(100% - 32px)',
          margin: 'auto',
          flexFlow: 'column nowrap',
          position: 'relative',
          '@bp600': {
            maxWidth: '57.75rem',
            mt: '2.5rem',
          },
          '@bp900': {
            maxWidth: '69rem',
            mb: '10.8125rem'
          }
        }}
      >
        <Flex
          direction="column"
          align="stretch"
          css={{
            py: 24
          }}>
          <Flex
            direction="column"
            css={{
              mb: 50
            }}>
            {stakingTitle}
            <Text css={{ maxWidth: '75%' }}>
            Lock your NFTE LP tokens obtained from{' '}
            <a
            href="https://app.gamma.xyz/vault/uni/arbitrum/details/nfte-weth-10000-wide"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'red' }}  // This line sets the color to red
            >
            Gamma Strategies
            </a>{' '}
            to receive xNFTE. xNFTE holders control protocol governance and earn all revenue sharing from the DAO. NFTEarth is governed entirely by xNFTE holders.
            </Text>
          </Flex>
          <Flex
            css={{
              mt: '3.5rem',
              mb: '4rem',
              '@md': {
                mt: '6rem',
              }
            }}
          >
            <Flex
              direction="column"
              css={{
                width: '100%'
              }}
            >
              <Flex
                css={{
                  overflow: 'auto',
                  maxWidth: '100vw',
                  ml: '-1.25rem',
                  mr: '-1.25rem',
                  mb: '1.5rem',
                  px: '1.25rem',
                }}
              >
                <Button
                  color="ghost"
                  css={{
                    mr: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    setActiveTab('stakes')
                  }}
                >
                 Your Stakes
                </Button>
                <Button
                  color="ghost"
                  css={{
                    mr: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    setActiveTab('staking')
                  }}
                >
                  Available To Stake
                </Button>
                <Button
                  color="ghost"
                  css={{
                    mr: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                  onClick={() => {
                    setActiveTab('claim')
                  }}
                >
                  Claim Staking Fees
                </Button>
              </Flex>
              <Box>
                <Flex
                  css={{
                    gap: '1rem',
                    mx: 0,
                    px: 0,
                    overflow: 'auto',
                    maxWidth: '100vw',
                    '@md': {
                      gap: '1.5rem',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(4, 1fr)',
                    }
                  }}
                >
                  {activeTab === 'stakes' && (
                    <StakeList lockedBalance={depositor?.lockedBalance || BigInt(0)} />
                  )}
                  {activeTab === 'staking' && (
                    <StakingList nfteLPBalance={nfteLPBalance?.result || BigInt(0)}/>
                  )}
                  {activeTab === 'claim' && (
                    <ClaimList />
                  )}
                </Flex>
              </Box>
            </Flex>
          </Flex>
          <Flex align="start" css={{ width: '100%' }}>
            <Text style="subtitle1">Staking Overview</Text>
          </Flex>
          <Flex css={{
            flexDirection: 'column',
            gap: '0.5rem',
            mt: '1rem',
            '@md': {
              display: 'grid',
              gridTemplateRows: '97px 97px',
              gridTemplateColumns: '322px 210px 1fr'
            }
          }}>
            <Flex css={{
              p: '1rem 1rem 0.75rem 1rem',
              border: '1px solid $gray4',
              background: '$gray3',
              borderRadius: 8,
            }} direction="column">
              <Flex
                align="center"
                justify="between"
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <CryptoCurrencyIcon
                    address={chain?.address || zeroAddress}
                    chainId={arbitrum.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">Total NFTE LP Locked</Text>
                </Flex>
                <FontAwesomeIcon icon={faLock} width={12} height={12}/>
              </Flex>
              <FormatCrypto
                textStyle="h5"
                maximumFractionDigits={2}
                options={{
                  minimumFractionDigits: 2,
                  notation: 'standard'
                }}
                containerCss={{
                  mt: 'auto',
                }}
                css={{
                  textAlign: 'right',
                  width: '100%'
                }}
                amount={lp?.totalStaked || 0n}
              />
            </Flex>
            <Flex css={{
              p: '1rem 1rem 0.75rem 1rem',
              border: '1px solid $gray4',
              background: '$gray3',
              borderRadius: 8,
            }} direction="column">
              <Flex
                align="center"
                justify="between"
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <CryptoCurrencyIcon
                    address={chain?.address || zeroAddress}
                    chainId={arbitrum.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">Percent of NFTE LP Locked</Text>
                </Flex>
              </Flex>
              <Text
                style="h5"
                css={{
                  mt: 'auto',
                  textAlign: 'right',
                  width: '100%'
                }}
              >
                {stakedPercent.toFixed(2)}%
              </Text>
            </Flex>
            <Flex css={{
              p: '1rem 1rem 0.75rem 1rem',
              border: '1px solid $gray4',
              background: '$gray3',
              borderRadius: 8,
            }} direction="column">
              <Flex
                align="center"
                justify="between"
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <CryptoCurrencyIcon
                    address={chain?.xNFTE || zeroAddress}
                    chainId={arbitrum.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">Total xNFTE</Text>
                </Flex>
              </Flex>
              <FormatCrypto
                textStyle="h5"
                maximumFractionDigits={2}
                options={{
                  minimumFractionDigits: 2,
                  notation: 'standard'
                }}
                containerCss={{
                  mt: 'auto',
                }}
                css={{
                  textAlign: 'right',
                  width: '100%'
                }}
                amount={totalSupplyXNfte?.result || 0n}
              />
            </Flex>
            <Flex css={{
              p: '1rem 1rem 0.75rem 1rem',
              border: '1px solid $gray4',
              background: '$gray3',
              borderRadius: 8,
            }} direction="column">
              <Flex
                align="center"
                justify="between"
              >
                <Flex
                  align="center"
                  css={{
                    gap: 5
                  }}
                >
                  <Text style="body4">Global Average lock time</Text>
                </Flex>
              </Flex>
              <Text
                style="h5"
                css={{
                  mt: 'auto',
                  textAlign: 'right',
                  width: '100%'
                }}
              >
                {`${(345)} days`}
              </Text>
            </Flex>
            <Flex css={{
              p: '1rem 1rem 0.75rem 1rem',
              border: '1px solid $gray4',
              background: '$gray3',
              borderRadius: 8,
              minHeight: '13.125rem',
              '@md': {
                mt: 0,
                gridRow: '1 / 3',
                gridColumn: 3,
                minHeight: 'initial',
                ml: '1rem',
              }
            }} direction="column">
              <Text style="h5">My Voting Power</Text>
              <Text
                as={Link}
                href="https://docs.nftearth.exchange/nfte-token/xnfte-and-nfte-staking"
                target="_blank"
                style="body3"
                css={{
                  '&:hover':{
                    textDecoration: 'underline'
                  }
                }}
              >{`Learn more about xNFTE in the NFTEarth docs`}</Text>
              <Flex
                css={{
                  flexWrap: 'wrap',
                  marginTop: 'auto',
                  '> div': {
                    mt: '1.5rem'
                  },
                  '> div:nth-child(even)': {
                    mx: '1.5rem'
                  }
                }}
              >
                <div>
                  <Text
                    style="body4"
                    css={{
                      mb: '0.5625rem',
                      display: 'inline-block'
                    }}
                  >My NFTE LP Locked</Text>
                  <FormatCryptoCurrency
                    amount={depositor?.lockedBalance || 0n}
                    textStyle="h6"
                    logoHeight={20}
                    address={chain?.address || zeroAddress}
                    chainId={arbitrum.id}
                  />
                </div>
                <div>
                  <Text
                    style="body4"
                    css={{
                      mb: '0.5625rem',
                      display: 'inline-block'
                    }}
                  >My xNFTE Balance</Text>
                  <FormatCryptoCurrency
                    amount={xNfteBalance?.result || 0n}
                    textStyle="h6"
                    logoHeight={20}
                    address={chain?.xNFTE || zeroAddress}
                    chainId={arbitrum.id}
                  />
                </div>
                <div>
                  <Text
                    style="body4"
                    css={{
                      mb: '0.5625rem',
                      display: 'inline-block'
                    }}
                  >Average Lock Time</Text>
                </div>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex
          align="center"
          justify="center"
          direction="column"
          css={{
            mt: '$3',
            gap: '1.5rem',
            '@md': {
              flexDirection: 'row'
            }
          }}
        >
          <Button
            color="tertiary"
            size="large"
            css={{
              flexGrow: 0,
              textAlign: 'center',
              display: 'inline-block',
              '@md': {
                maxWidth: '25%',
                flexBasis: '25%',
              }
            }}
            as={Link}
            href="https://discord.com/channels/1062256160264171520/1063532288866005043"
            target="_blank"
          >
            Governance Discussion
          </Button>
          <Button
            color="primary"
            size="large"
            css={{
              flexGrow: 0,
              textAlign: 'center',
              display: 'inline-block',
              '@md': {
                maxWidth: '25%',
                flexBasis: '25%',
              }
            }}
            as={Link}
            href="https://snapshot.org/#/nftearthl2.eth"
            target="_blank"
          >
            Snapshot Voting Portal
          </Button>
        </Flex>
      </Box>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Footer />
      </Box>
    </Layout>
  )
}

export default StakingPage;
