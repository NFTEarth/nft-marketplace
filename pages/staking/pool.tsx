import {useCallback, useContext, useMemo, useState} from "react";
import {
  useAccount, useBalance,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from "wagmi";
import {formatEther, parseEther, parseUnits, zeroAddress} from "viem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink, faSquarePlus} from "@fortawesome/free-solid-svg-icons";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useDebouncedEffect} from "@react-hookz/web";
import {getPublicClient} from "@wagmi/core";
import {arbitrum} from "viem/chains";
import {MaxUint256} from "ethers";
import Link from "next/link";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/bridge/NumericalInput";

import {ToastContext} from "context/ToastContextProvider";
import {useMarketplaceChain, useMounted} from "hooks";

import {OFT_CHAINS} from "utils/chains";
import {parseError} from "utils/error";
import {formatBN} from "utils/numbers";

import ERC20Abi from 'artifact/ERC20Abi'
import ERC20WethAbi from 'artifact/ERC20WethAbi'
import UniProxyAbi from 'artifact/UniProxyAbi'
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";

const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const POOL_ADDRESS = '0x17ee09e7a2cc98b0b053b389a162fc86a67b9407'

const PoolPage = () => {
  const mounted = useMounted()
  const { address} = useAccount()
  const { openConnectModal } = useConnectModal()
  const [valueWEth, setValueWEth] = useState<string>('0')
  const [valueNFTE, setValueNFTE] = useState<string>('0')
  const [expectedNFTELP, setExpectedNFTELP] = useState<bigint>(BigInt(0))
  const [changedValue, setChangedValue] = useState('')
  const [loading, setLoading] = useState(false)
  const publicClient = getPublicClient()
  const {addToast} = useContext(ToastContext)
  const chain = OFT_CHAINS.find(p => p.id === arbitrum.id)
  const addresses: Record<string, string> = {
    'NFTE': chain?.address as string,
    'WETH': WETH_ADDRESS as string,
    'NFTE/WETH LP Token': chain?.LPNFTE as string,
    'UniProxy': chain?.uniProxy as string,
    'Pool': POOL_ADDRESS as string
  }

  const { data: ethBalance } = useBalance({
    address

  })

  console.log('ethBalance', ethBalance)
  const { data: balanceData, refetch: refetchBalance } = useContractReads({
    contracts: [
      {
        abi:  ERC20Abi,
        address: WETH_ADDRESS as `0x${string}`,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: chain?.address as `0x${string}`,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: chain?.LPNFTE as `0x${string}`,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      }
    ],
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUSDAndNativePrice({
    chainId: arbitrum.id,
    contract: WETH_ADDRESS,
    price: expectedNFTELP
  })

  const isZeroValue = parseEther(valueWEth as `${number}`, 'wei', ) <= BigInt(0)

  const { data: allowanceData, refetch: refetchAllowance } = useContractReads({
    contracts: [
      {
        abi:  ERC20Abi,
        address: WETH_ADDRESS as `0x${string}`,
        functionName:  'allowance',
        args: [address as `0x${string}`, chain?.LPNFTE as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: chain?.address as `0x${string}`,
        functionName:  'allowance',
        args: [address as `0x${string}`, chain?.LPNFTE as `0x${string}`],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const [wethBalance, nfteBalance, nfteLPBalance ] = balanceData || [] as any
  const [wethAllowance, nfteAllowance] = allowanceData || [] as any
  const wethValue = useMemo(() => parseEther(valueWEth as `${number}`), [valueWEth])
  const nfteValue = useMemo(() => parseEther(valueNFTE as `${number}`), [valueNFTE])
  const requireWethAllowance = BigInt(wethAllowance?.result || 0) < wethValue
  const requireNFTEAllowance = BigInt(nfteAllowance?.result || 0) < nfteValue;
  const requireETHWrap = BigInt(wethBalance?.result || 0) < wethValue && (BigInt(ethBalance?.value || 0) + BigInt(wethBalance?.result || 0)) >= wethValue

  useDebouncedEffect(() => {
    if (changedValue === '') {
      return;
    }

    setLoading(true)
    const isWethChange = changedValue === 'weth'
    const value = isWethChange ? wethValue : nfteValue

    if (value > BigInt(0)) {
      publicClient.readContract(
        {
          abi: UniProxyAbi,
          address: chain?.uniProxy as `0x${string}`,
          functionName: 'getDepositAmount',
          args: [chain?.LPNFTE as `0x${string}`, isWethChange ? WETH_ADDRESS : chain?.address as `0x${string}`, value]
        }).then(async (res) => {
          const otherVal = isWethChange ? BigInt(res[1]) : BigInt(res[0])
          const val = parseFloat(formatEther(otherVal, 'wei')).toFixed(8)
          if (isWethChange) {
            setValueNFTE(val)
          } else {
            setValueWEth(val)
          }

          setExpectedNFTELP((isWethChange ? wethValue : otherVal) * BigInt(2))
          setChangedValue('')
          setLoading(false)
        }).catch(() => {
          setChangedValue('')
          setLoading(false)
        })
    }
  }, [changedValue, wethValue, nfteValue], 1000)

  const { config, error: preparedError, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address && !!chain?.xNFTE && !isZeroValue,
    address: chain?.uniProxy as `0x${string}`,
    abi: UniProxyAbi,
    functionName: 'deposit',
    args: [nfteValue, wethValue, address as `0x${string}`, chain?.LPNFTE as `0x${string}`, [BigInt(0),BigInt(0),BigInt(0),BigInt(0)]]
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)

  const { writeAsync: approveWethAsync, isLoading: isLoadingWethApproval } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [chain?.LPNFTE as `0x${string}`, MaxUint256],
  })

  const { writeAsync: approveNFTEAsync, isLoading: isLoadingNFTEApproval } = useContractWrite({
    address: chain?.address as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [chain?.LPNFTE as `0x${string}`, MaxUint256],
  })

  const { writeAsync: wrapEthAsync, isLoading: isLoadingWrapEth } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20WethAbi,
    functionName: 'deposit',
    value: wethValue - BigInt(wethBalance?.result || 0)
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const handleSetValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueWEth(val);
      setChangedValue('weth')
    } catch (e) {
      setValueWEth('0');
    }
  }

  const handleSetNFTEValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueNFTE(val);
      setChangedValue('nfte')
    } catch (e) {
      setValueNFTE('0');
    }
  }


  const handleSetMaxValue = useCallback(() => {
    handleSetValue(formatEther(BigInt(wethBalance?.result || 0) + BigInt(ethBalance?.value || 0), 'wei') || '0')
  }, [wethBalance])

  const handleSetMaxNFTEValue = useCallback(() => {
    handleSetNFTEValue(formatEther(BigInt(nfteBalance?.result || 0), 'wei') || '0')
  }, [nfteBalance])

  const disableButton = isZeroValue || loading || (!!preparedError && !requireNFTEAllowance && !requireWethAllowance && !requireETHWrap) || isLoading || isLoadingWethApproval || isLoadingNFTEApproval || isLoadingWrapEth || isLoadingTransaction

  const buttonText = useMemo(() => {
    if (!address) {
      return 'Connect Wallet'
    }

    if (requireETHWrap) {
      return 'Wrap ETH'
    }

    if (requireNFTEAllowance) {
      return 'Approve NFTE'
    }

    if (requireWethAllowance) {
      return 'Approve WETH'
    }

    if (preparedError) {
      const { message } = parseError(preparedError)

      return message
    }

    return 'Add Liquidity'
  }, [address, preparedError, requireETHWrap, requireNFTEAllowance, requireWethAllowance]);

  const handleAddLiquidity = useCallback(async () => {
    try {
      if (!address) {
        await openConnectModal?.()
      }

      if (requireETHWrap) {
        await wrapEthAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      if (requireNFTEAllowance) {
        await approveNFTEAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      if (requireWethAllowance) {
        await approveWethAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchBalance();
            await refetchPrepareContract()
          })
      }

      await writeAsync?.()
        .then((tx) => {
          addToast?.({
            title: 'Success',
            status: 'success',
            description: (
              <Flex
                direction="column"
              >
                <Text css={{ fontSize: 'inherit' }}>{`Add Liquidity Successful`}</Text>
                <Link
                  href={`${arbitrum.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`See Tx Receipt`}
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    width={15}
                    height={15}
                    style={{
                      marginLeft: 10
                    }}
                  />
                </Link>
              </Flex>
            )
          })
        })
    } catch (e: any) {
      await refetchAllowance();
      await refetchPrepareContract()
      addToast?.({
        title: parseError(e).name,
        status: 'error',
        description: parseError(e).message
      })
    }
  }, [requireWethAllowance, requireNFTEAllowance, requireETHWrap, writeAsync, wrapEthAsync, approveWethAsync, approveNFTEAsync, openConnectModal, addToast])

  if (!mounted) {
    return null;
  }

  return (
    <Layout>
      <AlertChainSwitch chainId={arbitrum.id}/>
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
          <Text style="subtitle1">{`Get NFTE/WETH LP Token`}</Text>
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
            <Text style="h6">Add Liquidity</Text>
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src="/icons/arbitrum-icon-dark.svg" width={14} height={14}  alt="Arbitrum"/>
              <Text style="body3" color="dark">Arbitrum</Text>
            </Flex>
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
                <Text style="body3">WETH Amount</Text>
                <Tooltip
                  align="right"
                  side="top"
                  content={
                    <Flex
                      direction="column"
                      css={{
                        gap: 5
                      }}
                    >
                      <Text style="body3">{`Balance: ${formatBN(BigInt(wethBalance?.result || 0), 6, 18)} WETH`}</Text>
                      <Text style="body3">{`Balance: ${formatBN(BigInt(ethBalance?.value || 0), 6, 18)} ETH`}</Text>
                    </Flex>
                  }
                >
                  <Text css={{
                    fontSize: 12
                  }}>{`Combined Balance: ${formatBN(BigInt(wethBalance?.result || 0) + BigInt(ethBalance?.value || 0), 6, 18)}`}</Text>
                </Tooltip>
              </Flex>
              <Box
                css={{
                  position: 'relative'
                }}
              >
                <NumericalInput
                  value={valueWEth}
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
                    boxShadow: 'inset 0 0 0 2px'
                  }}
                />
                <CryptoCurrencyIcon
                  address={WETH_ADDRESS as `0x${string}`}
                  chainId={arbitrum.id}
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
              align="center"
              justify="between"
            >
              <Flex>
                {BigInt(wethBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="https://swap.defillama.com/?chain=arbitrum&to=0x82af49447d8a07e3bd95bd0d56f35241523fbab1"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
                      borderRadius: 6,
                      px: 10,
                      py: 5
                    }}
                  >
                    {`Get WETH Token`}
                    <FontAwesomeIcon icon={faExternalLink} style={{ height: 12, width: 12, display: 'inline-block', marginLeft: 5 }}/>
                  </Text>
                )}
              </Flex>
              <FontAwesomeIcon icon={faSquarePlus} style={{ height: 40, width: 40}}/>
              <Flex>
                {BigInt(nfteBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="https://swap.defillama.com/?chain=arbitrum&to=0x51b902f19a56f0c8e409a34a215ad2673edf3284"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
                      borderRadius: 6,
                      px: 10,
                      py: 5
                    }}
                  >
                    {`Get NFTE Token`}
                    <FontAwesomeIcon icon={faExternalLink} style={{ height: 12, width: 12, display: 'inline-block', marginLeft: 5}}/>
                  </Text>
                )}
              </Flex>
            </Flex>
            <Flex
              direction="column"
              css={{
                gap: 5,
              }}
            >
              <Box
                css={{
                  position: 'relative'
                }}
              >
                <NumericalInput
                  value={valueNFTE}
                  onUserInput={handleSetNFTEValue}
                  icon={<Button size="xs" onClick={() => handleSetMaxNFTEValue()}>MAX</Button>}
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
                    boxShadow: 'inset 0 0 0 2px'
                  }}
                />
                <CryptoCurrencyIcon
                  address={chain?.address || `0x0`}
                  chainId={arbitrum.id}
                  css={{
                    position: 'absolute',
                    width: 25,
                    height: 25,
                    top: 10,
                    left: 10
                  }}
                />
              </Box>
              <Flex
                justify="between"
              >
                <Text style="body3">NFTE Amount</Text>
                <Text style="body3">{`Balance: ${formatBN(BigInt(nfteBalance?.result || 0), 6, 18)}`}</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                p: '14px 16px',
                backgroundColor: '$gray2',
                borderRadius: 8
              }}
            >
              <Text style="body2">Your Current NFTE Balance</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                <CryptoCurrencyIcon
                  address={chain?.LPNFTE as `0x${string}`}
                  chainId={chain?.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text style="body2">{`${formatBN(BigInt(nfteLPBalance?.result || 0), 6, 18)}`}</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                px: 16,
              }}
            >
              <Text style="body2">Amount Liquidity Providing (In USD)</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                {isLoadingUSDPrice ? (
                  <LoadingSpinner css={{ width: 20, height: 20,  border: '2px solid transparent', }}/>
                ) : (
                  <Text style="body2">{`$${formatBN(usdPrice?.usdPrice, 2, 6)}`}</Text>
                )}
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                p: '14px 16px',
                backgroundColor: '$gray2',
                borderRadius: 8
              }}
            >
              <Text style="body2">Expected To Receive</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                <CryptoCurrencyIcon
                  address={chain?.LPNFTE as `0x${string}`}
                  chainId={chain?.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text style="body2">{`${formatBN(expectedNFTELP, 8, 18)} NFTE/WETH LP Tokens`}</Text>
              </Flex>
            </Flex>
          </Flex>
          <Button
            disabled={disableButton}
            color="primary"
            size="large"
            css={{
              mt: 20,
              width: '100%',
              display: 'inline-block'
            }}
            onClick={handleAddLiquidity}
          >
            {buttonText}
          </Button>
        </Flex>
        <AddressCollapsible
          addresses={addresses}
          chain={arbitrum}
        />
        <Flex
          direction="column"
          css={{
            p: '1rem 1rem 0.75rem 1rem',
            px: 16,
            borderRadius: 8,
            textAlign: 'center',
            '@md': {
              width: 500
            }
          }}
        >
          <Text style="body3"><h2> 1. Add liquidity to the NFTE-WETH pool on Uniswap. </h2>2. Lock up the resulting NFTE/WETH LP token received (NFTE/WETH LP). <br></br> 3. The longer you lock your NFTE/WETH LP token (1 year max), the more xNFTE you get, and the greater your rewards and voting power. <Text style="body3" as={Link} css={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }} href="https://docs.nftearth.exchange/nfte-token/xnfte-and-nfte-staking" target="_blank"><h1>Learn more about xNFTE staking in the docs.</h1></Text></Text>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default PoolPage