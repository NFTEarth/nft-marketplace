import {useContractReads} from "wagmi";
import {Chain, formatUnits, ContractFunctionConfig, parseUnits} from "viem";
import dayjs from "dayjs";
import { base } from "utils/chains";

import useUSDAndNativePrice from "./useUSDAndNativePrice";

import FeeDistributorAbi from "../artifact/FeeDistributorAbi";
import veNFTEAbi from "../artifact/veNFTEAbi";
import NFTELPAbi from "../artifact/NFTELPAbi";

import {getPreviousWeek} from "../utils/date";
import {
  NFTEOFT,
  NFTE_LP,
  STAKING_FEE_DISTRIBUTOR,
  VE_NFTE,
  WETH_ADDRESS,
  POOL_ADDRESS
} from "../utils/contracts";


const useAPR = (timestamp: number | undefined, chain: Chain) => {
  timestamp = timestamp === undefined ? dayjs().startOf('day').toDate().getTime() : timestamp
  const previousWeekUnix = getPreviousWeek(timestamp);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        abi: FeeDistributorAbi,
        address: STAKING_FEE_DISTRIBUTOR as `0x${string}`,
        chainId: chain?.id,
        functionName: 'getTokensDistributedInWeek',
        args: [WETH_ADDRESS as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: FeeDistributorAbi,
        address: STAKING_FEE_DISTRIBUTOR as `0x${string}`,
        chainId: chain.id,
        functionName: 'getTokensDistributedInWeek',
        args: [NFTEOFT as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: veNFTEAbi,
        address: VE_NFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: chain?.id,
      },
      {
        abi: NFTELPAbi,
        address: NFTE_LP as `0x${string}`,
        functionName: 'getReserves',
        chainId: chain?.id,
      }
    ],
    allowFailure: true,
    watch: false,
    keepPreviousData: true
  })

  const [distributedWeth, distributedNFTEOFT, totalSupplyVeNfte, reserves] = data || []

  const { data: wethPrice, isLoading: isLoadingWethPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: distributedWeth?.result || BigInt(0)
  })

  const { data: nfteoftPrice, isLoading: isLoadingNFTEOFTPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: NFTEOFT,
    price: distributedNFTEOFT?.result || BigInt(0)
  })

  const { data: wethLiquidity, isLoading: isLoadingWethLiquidity } = useUSDAndNativePrice({
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: reserves?.result?.[0] || BigInt(0)
  })

  const { data: nfteoftLiquidity, isLoading: isLoadingNfteoftLiquidity } = useUSDAndNativePrice({
    chainId: base.id,
    contract: NFTEOFT,
    price: reserves?.result?.[1] || BigInt(0)
  })

  const veNfteSupply = parseFloat(formatUnits(totalSupplyVeNfte?.result || BigInt(0), 18))
  const lastWeekWethRevenue =  parseFloat(formatUnits(BigInt(wethPrice?.usdPrice || 0), 8) || '0')
  const lastWeekNFTEOFTRevenue =  parseFloat(formatUnits(BigInt(nfteoftPrice?.usdPrice || 0), 8) || '0')

  const lastWeekRevenue = (lastWeekWethRevenue + lastWeekNFTEOFTRevenue)
  const dailyRevenue = lastWeekRevenue / 7;
  const nfteLPLiquidity = parseFloat(wethLiquidity?.usdPrice || '0') + parseFloat(nfteoftLiquidity?.usdPrice || '0')

  const APR = Math.round(
    (10000 * (365 * dailyRevenue)) / (nfteLPLiquidity * veNfteSupply)
  ) * 52

  return {
    isLoading: isLoading || isLoadingWethPrice || isLoadingNFTEOFTPrice || isLoadingNfteoftLiquidity || isLoadingWethLiquidity,
    TVL: nfteLPLiquidity,
    dailyRevenue,
    lastWeekRevenue,
    dailyAPR: APR / 365,
    weeklyAPR: (APR / 365) * 7,
    APR
  }
}

export default useAPR;