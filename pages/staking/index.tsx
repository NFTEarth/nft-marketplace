import {useMemo, useState} from "react";
import {
  useAccount,
  useContractReads,
} from "wagmi";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faLock} from "@fortawesome/free-solid-svg-icons";
import {formatEther, zeroAddress} from "viem";
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

import { useAPR, useMounted, useStakingLP} from "hooks";


import {OFT_CHAINS} from "utils/chains";
import {formatBN} from "utils/numbers";

import ERC20Abi from 'artifact/ERC20Abi'
import veNFTEAbi from 'artifact/veNFTEAbi'
import { base } from "utils/chains";
import { NFTE_LP, VE_NFTE } from "utils/contracts";


const StakingPage = () => {
  const chain = OFT_CHAINS.find((chain) => chain.id === base.id)
  const isMounted = useMounted()
  const [activeTab, setActiveTab] = useState('stakes')
  const { APR } = useAPR(undefined, base)
  const { address } = useAccount()
  const { data: lp } = useStakingLP(NFTE_LP, { refreshInterval: 5000 })
  const { data: nfteoftData } : { data: any } = useContractReads({
    contracts: [
      // NFTE LP Balance
      {
        abi: ERC20Abi,
        address: NFTE_LP,
        chainId: base.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`]
      },
      // veNFTE Balance
      {
        abi: ERC20Abi,
        address: VE_NFTE,
        chainId: base.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      // veNFTE TotalSupply
      {
        abi: ERC20Abi,
        address: VE_NFTE,
        functionName: 'totalSupply',
        chainId: base.id,
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
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const [nfteLPBalance, veNfteBalance, totalSupplyVeNfte, locked] = nfteoftData || []

  const stakingTitle = useMemo(() => {
    if (BigInt(nfteLPBalance?.result || 0) === BigInt(0) && BigInt(locked?.result?.[0] || 0) === BigInt(0)) {
      return (
        <Flex
          direction="column"
        >
          <Text style="h4">You don’t have any NFTE/WETH LP tokens to stake in your wallet.</Text>
          <Text css={{ maxWidth: '75%' }}>{`veNFTE holders earn all revenue that is shared from the NFTEarth DAO. Governance is controlled entirely by veNFTE holders.`}</Text>
          <Flex css={{ mt: 20}}>
            <Button
              color="primary"
              as={Link}
              href="/staking/pool"
            >Get NFTE/WETH LP</Button>
          </Flex>
        </Flex>
      )
    }

    return (
      <Flex
        direction="column"
      >
        <Text style="h4">
          {`You have `}
          <Text style="h4" color="primary">
            {`${formatBN(veNfteBalance?.result || 0n, 2, 18, {})} veNFTE`}
          </Text>
          {` and `}
          <Text style="h4" color="primary">
            {`${formatBN(nfteLPBalance?.result || 0n, 2, 18, {})} NFTE/WETH LP tokens`}
          </Text>
          {` available to stake.`}
        </Text>
        <Text css={{ maxWidth: '75%' }}>{`veNFTE holders earn all revenue that is shared from the NFTEarth DAO. Governance is controlled entirely by veNFTE holders.`}</Text>
        <Flex css={{ mt: 20}}>
          <Button
            color="primary"
            as={Link}
            href="/staking/pool"
          >Get NFTE/WETH LP</Button>
        </Flex>
      </Flex>
    );

  }, [nfteLPBalance, veNfteBalance, totalSupplyVeNfte])

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
                    px: 10,
                    mr: '1rem',
                    whiteSpace: 'nowrap',
                    borderBottom: activeTab === 'stakes' ? '1px solid $primary9' : '1px solid transparent'
                  }}
                  onClick={() => {
                    setActiveTab('stakes')
                  }}
                >
                  My Staking
                </Button>
                <Button
                  color="ghost"
                  css={{
                    px: 10,
                    mr: '1rem',
                    whiteSpace: 'nowrap',
                    borderBottom: activeTab === 'staking' ? '1px solid $primary9' : '1px solid transparent'
                  }}
                  onClick={() => {
                    setActiveTab('staking')
                  }}
                >
                  Available to Stake
                </Button>
                <Button
                  color="ghost"
                  css={{
                    px: 10,
                    mr: '1rem',
                    whiteSpace: 'nowrap',
                    borderBottom: activeTab === 'claim' ? '1px solid $primary9' : '1px solid transparent'
                  }}
                  onClick={() => {
                    setActiveTab('claim')
                  }}
                >
                  Claim Staking Rewards
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
                    <StakeList
                      lockedBalance={locked?.result?.[0] || BigInt(0)}
                      lockEndTimestamp={locked?.result?.[1] || BigInt(0)}
                    />
                  )}
                  {activeTab === 'staking' && (
                    <StakingList
                      APR={APR}
                      nfteLPBalance={nfteLPBalance?.result || BigInt(0)} 
                      />
                  )}
                  {activeTab === 'claim' && (
                    <ClaimList />
                  )}
                </Flex>
              </Box>
            </Flex>
          </Flex>
          <Flex align="start" css={{ width: '100%' }}>
            <Text style="subtitle1">veNFTE Staking Overview</Text>
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
                    address={NFTE_LP || zeroAddress}
                    chainId={base.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">Total NFTE/WETH LP Locked</Text>
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
                    address={NFTE_LP || zeroAddress}
                    chainId={base.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">% of NFTE/WETH LP Locked</Text>
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
                    address={VE_NFTE || zeroAddress}
                    chainId={base.id}
                    css={{
                      width: 20,
                      height: 20
                    }}
                  />
                  <Text style="body4">Total veNFTE</Text>
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
                amount={totalSupplyVeNfte?.result || 0n}
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
               <Text style="body4">APR</Text>
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
                {`${APR}%`}
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
                href="https://docs.nftearth.exchange/nfte-token/venfte"
                target="_blank"
                style="body3"
                css={{
                  '&:hover':{
                    textDecoration: 'underline'
                  }
                }}
              >{`Learn more about veNFTE in our docs`}</Text>
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
                  >My Locked NFTE/WETH LP</Text>
                  <FormatCryptoCurrency
                    amount={locked?.result?.[0] || 0n}
                    textStyle="h6"
                    logoHeight={20}
                    address={NFTE_LP || zeroAddress}
                    chainId={base.id}
                  />
                </div>
                <div>
                  <Text
                    style="body4"
                    css={{
                      mb: '0.5625rem',
                      display: 'inline-block'
                    }}
                  >My veNFTE Balance</Text>
                  <FormatCryptoCurrency
                    amount={veNfteBalance?.result || 0n}
                    textStyle="h6"
                    logoHeight={20}
                    address={VE_NFTE || zeroAddress}
                    chainId={base.id}
                  />
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
