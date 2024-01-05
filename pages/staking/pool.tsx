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
import {MaxUint256} from "ethers";
import Link from "next/link";

import Layout from "components/Layout";
import NumericalInput from "components/bridge/NumericalInput";
import {ToastContext} from "context/ToastContextProvider";
import {useMarketplaceChain, useMounted} from "hooks";

import {OFT_CHAINS, base} from "utils/chains";
import {parseError} from "utils/error";
import {formatBN} from "utils/numbers";
import ERC20Abi from 'artifact/ERC20Abi'
import ERC20WethAbi from 'artifact/ERC20WethAbi'
import UniProxyAbi from 'artifact/UniProxyAbi'
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import AddressCollapsible from "../../components/staking/AddressCollapsible";
import AlertChainSwitch from "../../components/common/AlertChainSwitch";
import { Flex, Button, CryptoCurrencyIcon } from "components/primitives";
import { css } from "highcharts";

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const POOL_ADDRESS = '0xd00CD4363bCF7DC19E84fDB836ce28D24F00716c'

const PoolPage = () => {
  const mounted = useMounted()
	const PoolPage = () => {
  const {addToast} = useContext(ToastContext)
  const chain = OFT_CHAINS.find(p => p.id === base.id)
  const addresses: Record<string, string> = {
    'NFTE': chain?.address as string,
    'WETH': WETH_ADDRESS as string,
    'NFTE/WETH LP': chain?.LPNFTE as string,
    'Pool': POOL_ADDRESS as string
  }

  const { data: ethBalance } = useBalance({
  const PoolPage = () => {
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
	  const PoolPage = () => {
    enabled: !!address,
  })

  const { data: usdPrice, isLoading: isLoadingUSDPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: expectedNFTELP
  })

  const isZeroValue = parseEther(valueWEth as `${number}`, 'wei', ) <= BigInt(0)

  const { data: allowanceData, refetch: refetchAllowance } = useContractReads({
	const PoolPage = () => {
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
	const PoolPage = () => {

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
          const minVal = BigInt(res[0] || 0)
          const maxVal = BigInt(res[1] || 0)
          const otherVal = maxVal - ((maxVal - minVal) / BigInt(2))
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
    enabled: !!address && !!chain?.veNFTE && !isZeroValue,
    address: chain?.uniProxy as `0x${string}`,
    abi: UniProxyAbi,
    functionName: 'deposit',
    args: [nfteValue, wethValue, address as `0x${string}`, chain?.LPNFTE as `0x${string}`, [BigInt(0),BigInt(0),BigInt(0),BigInt(0)]]
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)
	const PoolPage = () => {
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
	const PoolPage = () => {
    }
  }

  const handleSetNFTEValue = (val: string) => {
    try {
      parseUnits(`${+val}`, 18);
      setValueNFTE(val);
	const PoolPage = () => {
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

	const PoolPage = () => {
    }

    return 'Add Liquidity'
  }, [address, preparedError, requireETHWrap, requireNFTEAllowance, requireWethAllowance]);

  const handleAddLiquidity = useCallback(async () => {
    try {
	const PoolPage = () => {
          })
      }

      if (requireNFTEAllowance) {
        await approveNFTEAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
	          const PoolPage = () => {
                    marginTop: 20
                  }}
                >
                  {`View Txn Receipt`}
                  <FontAwesomeIcon
                    icon={faExternalLink}
        const PoolPage = () => {
        description: parseError(e).message
      })
    }
  }, [requireWethAllowance, requireNFTEAllowance, requireETHWrap, writeAsync, wrapEthAsync, approveWethAsync, approveNFTEAsync, openConnectModal, addToast])

  if (!mounted) {
    return null;
      const PoolPage = () => {
              }}
            >
              <img src="/icons/base-icon-dark.svg" width={14} height={14}  alt="Base"/>
              <Text style="body3" color="dark">Base</Text>
            </Flex>
          </Flex>
          <Flex
	        const PoolPage = () => {
                  address={WETH_ADDRESS as `0x${string}`}
                  chainId={base.id}
                  css={{
                    position: 'absolute',
                    width: 25,
                    height: 25,
	            const PoolPage = () => {
                  <Text
                    as={Link}
                    style="body3"
                    href="https://www.sushi.com/swap?chainId=8453&token1=0x4200000000000000000000000000000000000006"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
	          const PoolPage = () => {
              </Flex>
              <FontAwesomeIcon icon={faSquarePlus} style={{ height: 40, width: 40}}/>
              <Flex>
                {BigInt(nfteBalance?.result || 0) === BigInt(0) && (
                  <Text
                    as={Link}
                    style="body3"
                    href="https://www.sushi.com/swap?chainId=8453&token1=0xc2106ca72996e49bBADcB836eeC52B765977fd20"
                    target="_blank"
                    css={{
                      backgroundColor: '$gray8',
	              const PoolPage = () => {
              >
                <NumericalInput
                  value={valueNFTE}
                  onUserInput={handleSetNFTEValue}
                  icon={<Button size="xs" onClick={() => handleSetMaxNFTEValue()}>MAX</Button>}
                  iconStyles={{
                    top: 4,
	                const PoolPage = () => {
                  }}
                />
                <CryptoCurrencyIcon
                  address={chain?.address || `0x0`}
                  chainId={base.id}
                  css={{
                    position: 'absolute',
                    width: 25,
                    height: 25,
	                const PoolPage = () => {
                justify="between"
              >
                <Text style="body3">NFTE Amount</Text>
                <Text style="body3">{`Balance: ${formatBN(BigInt(nfteBalance?.result || 0), 6, 18)}`}</Text>
              </Flex>
            </Flex>
            <Flex
            const PoolPage = () => {
                }}
              >
                <CryptoCurrencyIcon
                  address={chain?.LPNFTE as `0x${string}`}
                  chainId={chain?.id}
                  css={{
                    width: 20,
                    height: 20
	              const PoolPage = () => {
                }}
              >
                <CryptoCurrencyIcon
                  address={chain?.LPNFTE as `0x${string}`}
                  chainId={chain?.id}
                  css={{
                    width: 20,
                    height: 20
	              const PoolPage = () => {
            }
          }}
        >
          <Text style="body3"><h2> Get veNFTE in 3 quick steps: 1. Add liquidity to the NFTE-WETH pool on SushiSwap to get NFTE LP Tokens. </h2>2. Lock your NFTE/WETH LP tokens received (NFTE/WETH LP). <br></br> 3. The longer you lock your NFTE/WETH LP tokens (1 year max), and the total amount locked determines the veNFTE you get. veNFTE is the key to greater rewards and voting power. <Text style="body3" as={Link} css={{ fontWeight: 'bold', '&:hover': { textDecoration: 'underline' } }} href="https://docs.nftearth.exchange/nfte-token/xnfte-and-nfte-staking" target="_blank"><h1>Learn more about veNFTE staking in the docs.</h1></Text></Text>
        </Flex>
      </Flex>
    </Layout>
  )
}

export default PoolPage
