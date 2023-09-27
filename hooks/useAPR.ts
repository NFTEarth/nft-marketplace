import {useContractReads} from "wagmi";
import {formatUnits} from "viem";
import {arbitrum} from "viem/chains";

import useUSDAndNativePrice from "./useUSDAndNativePrice";

import FeeDistributorAbi from "../artifact/FeeDistributorAbi";
import xNFTEAbi from "../artifact/xNFTEAbi";
import NFTELPAbi from "../artifact/NFTELPAbi";
import UniswapV3Abi from "../artifact/UniswapV3Abi";

import {OFTChain} from "../utils/chains";
import {getPreviousWeek} from "../utils/date";
import dayjs from "dayjs";

const WETH_ADDRESS = '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
const POOL_ADDRESS = '0x17ee09e7a2cc98b0b053b389a162fc86a67b9407'


const useAPR = (timestamp: number = dayjs().startOf('day').toDate().getTime(), chain: OFTChain) => {
  const previousWeekUnix = getPreviousWeek(timestamp);
  console.log(previousWeekUnix, dayjs(previousWeekUnix * 1000).format())
  const { data, isLoading } = useContractReads({
    contracts: [
      {
        abi: FeeDistributorAbi,
        address: chain.feeDistributor as `0x${string}`,
        chainId: chain.id,
        functionName: 'getTokensDistributedInWeek',
          args: [WETH_ADDRESS as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: FeeDistributorAbi,
        address: chain.feeDistributor as `0x${string}`,
        chainId: chain.id,
        functionName: 'getTokensDistributedInWeek',
        args: [chain.address as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: xNFTEAbi,
        address: chain.xNFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: chain.id,
      },
      {
        abi: NFTELPAbi,
        address: chain.LPNFTE as `0x${string}`,
        functionName: 'getBasePosition',
        chainId: chain.id,
      },
      {
        abi: UniswapV3Abi,
        address: POOL_ADDRESS as `0x${string}`,
        functionName: 'liquidity',
        chainId: chain.id,
      }
    ],
    allowFailure: true,
    watch: false,
    keepPreviousData: true
  })

  const [distributedWeth, distributedNFTE, totalSupplyXNfte, basePositionLP, liquidity] = data || []
  console.log('data', data)

  const { data: wethPrice, isLoading: isLoadingWethPrice } = useUSDAndNativePrice({
    chainId: arbitrum.id,
    contract: WETH_ADDRESS,
    price: distributedWeth?.result || BigInt(0)
  })

  const { data: nftePrice, isLoading: isLoadingNFTEPrice } = useUSDAndNativePrice({
    chainId: arbitrum.id,
    contract: chain.address,
    price: distributedNFTE?.result || BigInt(0)
  })

  const xNfteSupply = parseFloat(formatUnits(totalSupplyXNfte?.result || BigInt(0), 18))
  const lastWeekWethRevenue =  parseFloat(formatUnits(BigInt(wethPrice?.usdPrice || 0), 8) || '0')
  const lastWeekNFTERevenue =  parseFloat(formatUnits(BigInt(nftePrice?.usdPrice || 0), 8) || '0')

  const dailyRevenue = (lastWeekWethRevenue + lastWeekNFTERevenue) / 7;
  const nFTELPLiquidity = parseFloat(formatUnits((basePositionLP?.result?.[0] || BigInt(0)) + (liquidity?.result || BigInt(0)), 18))

  return {
    isLoading: isLoading || isLoadingWethPrice || isLoadingNFTEPrice,
    TVL: (basePositionLP?.result?.[0] || BigInt(0)),
    dailyRevenue,
    APR: Math.round(
      (10000 * (365 * dailyRevenue)) / (nFTELPLiquidity * xNfteSupply)
    )
  }
}

export default useAPR;