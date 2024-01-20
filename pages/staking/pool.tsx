import {FC, useCallback, useContext, useMemo, useState} from "react";
import {
  useAccount, useBalance, useContractRead,
  useContractReads,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction
} from "wagmi";
import {formatEther, parseEther, parseUnits} from "viem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink, faSquarePlus} from "@fortawesome/free-solid-svg-icons";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useDebouncedEffect} from "@react-hookz/web";
import {getPublicClient} from "@wagmi/core";
import Link from "next/link";

import Layout from "components/Layout";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "components/primitives";
import NumericalInput from "components/bridge/NumericalInput";

import {ToastContext} from "context/ToastContextProvider";
import {useMarketplaceChain, useMounted} from "hooks";

import {parseError} from "utils/error";
import {formatBN} from "utils/numbers";

import {OFT_CHAINS, base} from "utils/chains";

import ERC20Abi from 'artifact/ERC20Abi'
import ERC20WethAbi from 'artifact/ERC20WethAbi'
import UniswapV2RouterAbi from 'artifact/UniswapV2RouterAbi'
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";

import {NFTEOFT, NFTE_LP, STAKING_UNI_ROUTER, WETH_ADDRESS} from "../../utils/contracts";
import {MaxUint256} from "@ethersproject/constants";
import NFTELPAbi from "../../artifact/NFTELPAbi";
import {InferGetServerSidePropsType} from "next";
import {getServerSideProps} from "../portfolio/settings";
import NFTEOFTAbi from "artifact/NFTEOFTAbi";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const PoolPage = () => {
  const mounted = useMounted()
  const { address} = useAccount()
  const { openConnectModal } = useConnectModal()
  const [valueWeth, setValueWeth] = useState<string>('0')
  const [valueNFTEOFT, setValueNFTEOFT] = useState<string>('0')
  const [expectedNFTELP, setExpectedNFTELP] = useState<bigint>(BigInt(0))
  const [changedValue, setChangedValue] = useState('')
  const [loading, setLoading] = useState(false)
  const publicClient = getPublicClient()
  const {addToast} = useContext(ToastContext)
  const chain = OFT_CHAINS.find(p => p.id === base.id)
  const addresses: Record<string, string> = {
    'NFTE': NFTEOFT,
    'WETH': WETH_ADDRESS,
    'NFTE/WETH LP': NFTE_LP,
    'Uniswap Router': STAKING_UNI_ROUTER
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
        address: NFTEOFT,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi:  ERC20Abi,
        address: NFTE_LP,
        functionName:  'balanceOf',
        args: [address as `0x${string}`],
      }
    ],
    watch: true,
    allowFailure: true,
    enabled: !!address,
  })

  const isZeroValue = parseEther(valueWeth as `${number}`, 'wei', ) <= BigInt(0)

  const { data: allowanceData, refetch: refetchAllowance } = useContractReads({
    contracts: [
      {
        abi:  ERC20Abi,
        address: WETH_ADDRESS as `0x${string}`,
        functionName:  'allowance',
        args: [address as `0x${string}`, STAKING_UNI_ROUTER],
      },
      {
        abi:  ERC20Abi,
        address: NFTEOFT,
        functionName:  'allowance',
        args: [address as `0x${string}`, STAKING_UNI_ROUTER],
      }
    ],
    watch: false,
    allowFailure: true,
    enabled: !!address,
  })

  const { data: lpData } = useContractReads({
    contracts: [
      {
        abi: NFTELPAbi,
        address: NFTE_LP,
        functionName: 'getReserves'
      },
      {
        abi: NFTEOFTAbi,
        address: NFTE_LP,
        functionName: 'totalSupply',
      }
    ],
    watch: true
  })


  const [reserveData, totalSupplyLP] = lpData || [] as any
  const [reserveETH, reserveNFTEOFT, blockTimestampLast] = reserveData?.result || [] as any
  const [wethBalance, nfteoftBalance, nfteLPBalance ] = balanceData || [] as any
  const [wethAllowance, nfteoftAllowance] = allowanceData || [] as any
  const wethValue = useMemo(() => parseEther(valueWeth as `${number}`), [valueWeth])
  const nfteoftValue = useMemo(() => parseEther(valueNFTEOFT as `${number}`), [valueNFTEOFT])
  const requireWethAllowance = useMemo(() => BigInt(wethAllowance?.result || 0) < wethValue, [wethAllowance?.result, wethValue]);
  const requireNFTEOFTAllowance = useMemo(() => BigInt(nfteoftAllowance?.result || 0) < nfteoftValue, [nfteoftAllowance?.result, nfteoftValue]);
  const requireETHWrap = useMemo(() => BigInt(wethBalance?.result || 0) < wethValue && (BigInt(ethBalance?.value || 0) + BigInt(wethBalance?.result || 0)) >= wethValue, [ethBalance?.value, wethBalance?.result, wethValue])

  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: wethValue * BigInt(2)
  })

  useDebouncedEffect(() => {
    if (changedValue === '') {
      return;
    }

    setLoading(true)
    const isWethChange = changedValue === 'weth'
    const value = isWethChange ? wethValue : nfteoftValue

    if (value > BigInt(0)) {
      publicClient.readContract(
        {
          abi: UniswapV2RouterAbi,
          address: STAKING_UNI_ROUTER,
          functionName: 'quote',
          args: [value, isWethChange ? reserveETH || BigInt(0) : reserveNFTEOFT || BigInt(0), isWethChange ? reserveNFTEOFT || BigInt(0) : reserveETH || BigInt(0)]
        }).then(async (res) => {
          const val = (parseFloat(formatEther(res, 'wei')) * 0.97).toString()
          if (isWethChange) {
            setValueNFTEOFT(val)
          } else {
            setValueWeth(val)
          }

          const wethLiquidity = (isWethChange ? BigInt(value) : parseEther(val as `${number}`)) * BigInt(totalSupplyLP?.result || 0) / BigInt(reserveETH || 0);
          const nfteoftLiquidity = (isWethChange ? parseEther(val as `${number}`) : BigInt(value)) * BigInt(totalSupplyLP?.result || 0) / BigInt(reserveNFTEOFT || 0);
          
          const expectedNFTELP = nfteoftLiquidity > wethLiquidity ? wethLiquidity : nfteoftLiquidity;
          console.log(wethLiquidity, nfteoftLiquidity, expectedNFTELP, res, totalSupplyLP?.result);
          
          setExpectedNFTELP(expectedNFTELP)
          setChangedValue('')
          setLoading(false)
        }).catch(() => {
          setChangedValue('')
          setLoading(false)
        })
    }
  }, [changedValue, wethValue, nfteoftValue, totalSupplyLP?.result, reserveNFTEOFT, reserveETH], 1000)

  const { config, error: preparedError, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address && !isZeroValue,
    address: STAKING_UNI_ROUTER,
    abi: UniswapV2RouterAbi,
    functionName: 'addLiquidity',
    args: [
      WETH_ADDRESS,
      NFTEOFT,
      wethValue,
      nfteoftValue,
      parseEther(`${parseFloat(valueWeth) * 0.97}`), // 0.3% slippage
      parseEther(`${parseFloat(valueNFTEOFT) * 0.97}`), // 0.3% slippage
      address as `0x${string}`,
      BigInt(Math.round(((new Date()).getTime() + (1000 * 60 * 5)) / 1000)) // 5 Minute Deadline
    ],
    account: address
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)

  const { writeAsync: approveWethAsync, isLoading: isLoadingWethApproval } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [NFTE_LP, BigInt(MaxUint256.toString())],
    account: address
  })

  const { writeAsync: approveNFTEOFTAsync, isLoading: isLoadingNFTEOFTApproval } = useContractWrite({
    address: NFTEOFT,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [NFTE_LP, BigInt(MaxUint256.toString())],
    account: address
  })

  const { writeAsync: wrapEthAsync, isLoading: isLoadingWrapEth } = useContractWrite({
    address: WETH_ADDRESS as `0x${string}`,
    abi: ERC20WethAbi,
    functionName: 'deposit',
    value: wethValue - BigInt(wethBalance?.result || 0),
    account: address
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const handleSetValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueWeth(val);
      setChangedValue('weth')
    } catch (e) {
      setValueWeth('0');
    }
  }

  const handleSetNFTEOFTValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueNFTEOFT(val);
      setChangedValue('nfte')
    } catch (e) {
      setValueNFTEOFT('0');
    }
  }


  const handleSetMaxValue = useCallback(() => {
    handleSetValue(formatEther(BigInt(wethBalance?.result || 0) + BigInt(ethBalance?.value || 0), 'wei') || '0')
  }, [wethBalance])

  const handleSetMaxNFTEOFTValue = useCallback(() => {
    handleSetNFTEOFTValue(formatEther(BigInt(nfteoftBalance?.result || 0), 'wei') || '0')
  }, [nfteoftBalance])

  const disableButton = isZeroValue || loading || (!!preparedError && !requireNFTEOFTAllowance && !requireWethAllowance && !requireETHWrap) || isLoading || isLoadingWethApproval || isLoadingWethApproval || isLoadingWrapEth || isLoadingTransaction

  const buttonText = useMemo(() => {
    if (!address) {
      return 'Login'
    }

    if (requireETHWrap) {
      return 'Wrap ETH'
    }

    if (requireNFTEOFTAllowance) {
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
  }, [address, preparedError, requireETHWrap, requireNFTEOFTAllowance, requireWethAllowance]);

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

      if (requireNFTEOFTAllowance) {
        await approveNFTEOFTAsync?.()
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
                <Text css={{ fontSize: 'inherit' }}>{`Successfully Added Liquidity`}</Text>
                <Link
                  href={`${base.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`View Txn Receipt`}
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
  }, [requireWethAllowance, requireNFTEOFTAllowance, requireETHWrap, writeAsync, wrapEthAsync, approveWethAsync, approveWethAsync, openConnectModal, addToast])

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
          <Text style="subtitle1">{`Get NFTE/WETH LP`}</Text>
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
              <img src="/icons/base-icon-dark.svg" width={14} height={14}  alt="Base"/>
              <Text style="body3" color="dark">Base</Text>
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
                  value={valueWeth}
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
                  chainId={base.id}
                  css={{
                    objectFit: 'contain',
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
                    href="https://swap.defillama.com/?chain=base&from=0x0000000000000000000000000000000000000000&to=0x4200000000000000000000000000000000000006"
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
                {BigInt(nfteoftBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="https://swap.defillama.com/?chain=base&from=0x0000000000000000000000000000000000000000&to=0xc2106ca72996e49bBADcB836eeC52B765977fd20"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
                      borderRadius: 6,
                      px: 10,
                      py: 5
                    }}
                  >
                    {`Get NFTE`}
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
                  value={valueNFTEOFT}
                  onUserInput={handleSetNFTEOFTValue}
                  icon={<Button size="xs" onClick={() => handleSetMaxNFTEOFTValue()}>MAX</Button>}
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
                  address={NFTEOFT}
                  chainId={base.id}
                  css={{
                    objectFit: 'contain',
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
                <Text style="body3">{`Balance: ${formatBN(BigInt(nfteoftBalance?.result || 0), 6, 18)}`}</Text>
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
              <Text style="body2">Your Current NFTE LP Balance</Text>
              <Flex
                align="center"
                css={{
                  gap: 5
                }}
              >
                <CryptoCurrencyIcon
                  address={NFTE_LP}
                  chainId={base.id}
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
                  address={NFTE_LP}
                  chainId={base.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
                <Text style="body2">{`${formatBN(expectedNFTELP, 6, 18)}`}</Text>
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
          chain={base}
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
          <Text style="body3"><h2> Get veNFTE in 3 easy steps: <br></br> 1. Add to the NFTE/WETH liquidity pool on SushiSwap. </h2>2. Lock the SushiSwap LP Tokens received (NFTE/WETH LP). <br></br> 3. The longer lock and the more LP tokens locked, the more veNFTE you get. <Text style="body3" as={Link} css={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }} href="https://docs.nftearth.exchange/nfte-token/venfte" target="_blank"><h1>Learn more about veNFTE in our docs.</h1></Text></Text>
        </Flex>
      </Flex>
    </Layout>
  )
}



export default PoolPage
