import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
  useAccount,
  useSwitchNetwork,
  useContractReads,
  useContractWrite,
  useWalletClient,
  useWaitForTransaction,
  useContractRead,
  useNetwork
} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight, faLock} from "@fortawesome/free-solid-svg-icons";
import {formatEther, formatUnits, parseEther, parseUnits, solidityPacked} from 'ethers';
import {ContractFunctionConfig, zeroAddress} from "viem";
import {useDebounce} from "usehooks-ts";
import {Abi} from "abitype";
import Image from 'next/image'

import Layout from "components/Layout";
import {Footer} from "components/Footer";
import {
  Select,
  Box,
  Button,
  Flex,
  Text,
  CryptoCurrencyIcon,
  FormatCrypto,
  FormatCryptoCurrency
} from "components/primitives";
import Slider from "components/primitives/Slider";
import NumericalInput from "components/bridge/NumericalInput";

import {useMounted} from "hooks";
import {formatBN, formatNumber} from "utils/numbers";
import {OFT_CHAINS} from "utils/chains";
import {ToastContext} from "context/ToastContextProvider";
import NFTEOFTAbi from 'artifact/NFTEOFTAbi.json'
import {hexZeroPad} from "@ethersproject/bytes";
import {BigNumber} from "@ethersproject/bignumber";
import { ChainId, Token, WETH, Fetcher, Route } from "@uniswap/sdk";
import { abi as UniswapV3PoolAbi } from "@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json";
import {arbitrum} from "viem/chains";
import Link from "next/link";

const currentAPY = 0.05

const StakingPage = () => {
  const { addToast } = useContext(ToastContext)
  const [ fromChainId, setFromChainId ] = useState<number>(OFT_CHAINS[0].id)
  const [ toChainId, setToChainId ] = useState<number>(OFT_CHAINS[1].id)
  const { openConnectModal } = useConnectModal()
  const [bridgePercent, setBridgePercent] = useState(0);
  const [valueEth, setValueEth] = useState<string>('0.0')
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: fromChainId,
  })
  const { data: signer } = useWalletClient()
  const isMounted = useMounted()
  const { chain: activeChain } = useNetwork()
  const { address } = useAccount()

  const debouncedPercent = useDebounce(bridgePercent, 500);
  const debouncedValueEth = useDebounce(valueEth, 500);

  const NFTEOFT = NFTEOFTAbi as Abi

  const chain = OFT_CHAINS.find((chain) => chain.id === arbitrum.id)

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
      },
      // xNFTE Balance
      {
        abi: NFTEOFT,
        address: chain?.xNFTE as `0x${string}`,
        chainId: arbitrum.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      // Staked LPNFTE
      {
        abi: NFTEOFT,
        address: chain?.LPNFTE as `0x${string}`,
        chainId: arbitrum.id,
        functionName: 'balanceOf',
        args: [chain?.xNFTE as `0x${string}`],
      },
      // Total Supply LPNFTE
      {
        abi: NFTEOFT,
        address: chain?.LPNFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: arbitrum.id,
        args: [],
      },
      {
        abi: NFTEOFT,
        address: chain?.xNFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: arbitrum.id,
        args: [],
      }
    ],
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const [nfteLPBalance, xNfteBalance, totalStakedNfteLP, totalSupplyNfteLP, totalSupplyXNfte] = useMemo(() => {
    return nfteData || []
  }, [nfteData])

  const stakingTitle = useMemo(() => {
    const APY = '1.45';

    if (nfteLPBalance?.result === 0n) {
      return (
        <Text style="h3">You don’t have LP NFTE available to stake in your wallet.</Text>
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

  }, [nfteLPBalance, xNfteBalance, totalStakedNfteLP, totalSupplyNfteLP, totalSupplyXNfte])

  const stakedPercent = useMemo(() => {
    return parseInt(((BigInt(totalStakedNfteLP?.result || 0n) * BigInt(10000)) / BigInt(totalSupplyNfteLP?.result || 1n)).toString()) / 100
  }, [totalStakedNfteLP, totalSupplyNfteLP])

  useEffect(() => {
    if (nfteLPBalance?.result) {
      const val = formatUnits(BigInt(bridgePercent) * BigInt(nfteLPBalance?.result) / BigInt(100), 18)
      setValueEth(val)
    }
  }, [debouncedPercent])

  // const { writeAsync, data, isLoading } = useContractWrite<typeof NFTEOFTAbi, 'sendFrom', undefined>({
  //   address: chain.address as `0x${string}`,
  //   abi: NFTEOFTAbi,
  //   functionName: 'sendFrom',
  //   value: BigInt(0),
  //   args: [
  //     address || '0x',
  //
  //     hexZeroPad(address || '0x', 32),
  //     parseEther(debouncedValueEth || '0'),
  //     [address, zeroAddress, '0x']
  //   ],
  // })

  // const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
  //   hash: data?.hash,
  //   enabled: !!data?.hash
  // })

  const handleSetValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const handleBridge = async () => {
    if (switchNetworkAsync && activeChain?.id !== fromChainId) {
      const newChain = await switchNetworkAsync(fromChainId)
      if (newChain.id !== fromChainId) {
        return false
      }
    }

    if (!signer) {
      openConnectModal?.()
    }

    // await writeAsync?.()
    //   .then(() => {
    //     setBridgePercent(0)
    //     setValueEth('0.0')
    //   }).catch(e => {
    //     addToast?.({
    //       title: 'Error',
    //       description: e.cause?.reason || e.shortMessage || e.message
    //     })
    //   })
  }

  const handleSetFromChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setFromChainId(idInt);

    if (toChainId === idInt) {
      setToChainId(OFT_CHAINS.find((chain) => chain.id !== idInt)?.id || 10)
    }
  }, [toChainId])

  const handleSetToChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setToChainId(idInt);

    if (chain?.id === idInt) {
      setFromChainId(OFT_CHAINS.find((chain) => chain?.id !== idInt)?.id || 1)
    }
  }, [chain])

  const trigger = useMemo(() => (
    <Select.Trigger
      title={chain?.name}
      css={{
        py: '$3',
        width: 'auto'
      }}
    >
      <Select.Value asChild>
        <Flex align="center" justify="center" css={{ gap: 10 }}>
          <img style={{ height: 17 }} src={chain?.darkIconUrl} />
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [chain])

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
            <Text css={{ maxWidth: '75%' }}>{`Lock your NFTE tokens to receive xNFTE, the unit of NFTEarth governance voting power. NFTEarth is governed entirely by NFTE token holders via voting escrow.`}</Text>
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
                >
                 Your Stakes
                </Button>
                <Button
                  color="ghost"
                  css={{
                    mr: '1rem',
                    whiteSpace: 'nowrap'
                  }}
                >
                  Available
                </Button>
                <Button
                  color="ghost"
                  css={{
                    mr: '1rem',
                    whiteSpace: 'nowrap'
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
                  {(new Array(4).fill('')).map((x, i) => (
                    <Box
                      key={`box-${i}`}
                      css={{
                        border: '1px dashed #999999',
                        opacity: 0.2,
                        minWidth: '16.125rem',
                        background: '#323232',
                        minHeight: '9.875rem',
                        borderRadius: '0.75rem',
                        content: ' '
                      }}
                    />
                  ))}
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
                  <Text style="body4">Total NFTE Locked</Text>
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
                amount={totalStakedNfteLP?.result || 0n}
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
                  <Text style="body4">Percent NFTE Locked</Text>
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
                {`${(439)} days`}
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
              <Text style="h5">My Voting power</Text>
              <Text
                as={Link}
                href="https://docs.nftearth.exchange/"
                target="_blank"
                style="body3"
                css={{
                  '&:hover':{
                    textDecoration: 'underline'
                  }
                }}
              >{`Learn more on NFTEarth Dao documentation >`}</Text>
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
                  >My NFTE Locked</Text>
                  <FormatCryptoCurrency
                    amount={0n}
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
                  >Average Lock</Text>
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
            Governance Forum
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
            Vote on Snapshot
          </Button>
        </Flex>
        <Flex
          direction="column"
          align="center"
          css={{
            mt: '$5',
            textAlign: 'right'
          }}
        >
          <Text style="body3">Powered by</Text>
          {/*<Image src="/images/LayerZero_Logo.svg" width={150} height={40} alt="LayerZero" />*/}
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
