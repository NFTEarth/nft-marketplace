import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
  useAccount,
  useBalance,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from "wagmi";
import { formatEther, parseEther, parseUnits} from "viem";
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
import ERC20OracleAbi from 'artifact/ERC20OracleAbi'
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import useMerklReward from "../../hooks/useMerklReward";

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

  const ethBalance = useBalance({
    address,
    chainId: arbitrum.id
  })
  const wethBalance = useBalance({
    address,
    token: WETH_ADDRESS,
    chainId: arbitrum.id
  })
  const nfteBalance = useBalance({
    address,
    token: chain?.address,
    chainId: arbitrum.id
  })
  const nfteLPBalance = useBalance({
    address,
    token: chain?.LPNFTE,
    chainId: arbitrum.id
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

  const [wethAllowance, nfteAllowance] = allowanceData || [] as any
  const wethValue = useMemo(() => parseEther(valueWEth as `${number}`), [valueWEth])
  const nfteValue = useMemo(() => parseEther(valueNFTE as `${number}`), [valueNFTE])
  const requireWethAllowance = useMemo(() =>BigInt(wethAllowance?.result || 0) < wethValue, [wethAllowance, wethValue])
  const requireNFTEAllowance = useMemo(() => BigInt(nfteAllowance?.result || 0) < nfteValue, [nfteAllowance, nfteValue]);
  const requireETHWrap = useMemo(() => BigInt(wethBalance?.data?.value || 0) < wethValue && BigInt(ethBalance.data?.value || 0) >= wethValue,  [wethValue, ethBalance, wethBalance])

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
          const otherVal = ((BigInt(res[1]) - BigInt(res[0])) / BigInt(2)) + BigInt(res[0])
          const val = formatEther(otherVal, 'wei')
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
    value: wethValue
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

  const handleSetMaxValue = () => {
    handleSetValue(formatBN(wethBalance?.data?.value, 6, 18) || '0')
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

  const handleSetMaxNFTEValue = () => {
    handleSetNFTEValue(formatBN(nfteBalance?.data?.value, 6, 18) || '0')
  }

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
                <Text css={{ fontSize: 'inherit' }}>{`Add Liquidity Success!`}</Text>
                <Link
                  href={`${arbitrum.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`See Receipt`}
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
          <Text style="subtitle1">{`NFTE/WETH Liquidity Pool`}</Text>
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
                <Text style="body3">{`Balance: ${formatBN(wethBalance.data?.value, 6, 18)}`}</Text>
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
              justify="center"
            >
              <FontAwesomeIcon icon={faSquarePlus} style={{ height: 40, width: 40}}/>
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
                <Text style="body3">{`Balance: ${formatBN(nfteBalance.data?.value, 6, 18)}`}</Text>
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
              <Text style="body2">Your Current Balance</Text>
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
                <Text style="body2">{`${formatBN(nfteLPBalance.data?.value, 6, nfteLPBalance.data?.decimals)} NFTE LP`}</Text>
              </Flex>
            </Flex>
            <Flex
              justify="between"
              css={{
                px: 16,
              }}
            >
              <Text style="body2">Total Liquidity Providing (In USD)</Text>
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
                <Text style="body2">{`${formatBN(expectedNFTELP, 8, 18)} NFTE LP`}</Text>
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
          <Text style="body3">Add liquidity to the NFTE-WETH LP pool. Lock up the resulting LP token xNFTE-WETH. The longer you lock (1 year max), the more xNFTE you get. <Text style="body3" as={Link} css={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }} href="https://docs.nftearth.exchange/nfte-token/xnfte-and-nfte-staking" target="_blank">Learn More about xNFTE</Text></Text>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default PoolPage