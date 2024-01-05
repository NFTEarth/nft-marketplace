import {useContractReads} from "wagmi";
import {formatUnits} from "viem";
import { base } from "../utils/chains";
import useUSDAndNativePrice from "./useUSDAndNativePrice";

import FeeDistributorAbi from "../artifact/FeeDistributorAbi";
import veNFTEAbi from "../artifact/veNFTEAbi";
import NFTELPAbi from "../artifact/NFTELPAbi";
import NFTEOFTAbi from "artifact/NFTEOFTAbi";
import UniswapV2RouterAbi from "artifact/UniswapV2RouterAbi";

import {OFTChain} from "../utils/chains";
import {getPreviousWeek} from "../utils/date";
import dayjs from "dayjs";

const WETH_ADDRESS = '0x4200000000000000000000000000000000000006'
const POOL_ADDRESS = '0xd00CD4363bCF7DC19E84fDB836ce28D24F00716c'


const useAPR = (timestamp: number = dayjs().startOf('day').toDate().getTime(), chain: OFTChain) => {
  const previousWeekUnix = getPreviousWeek(timestamp);

  const { data, isLoading } = useContractReads({
    contracts: [
      {
        abi: FeeDistributorAbi,
        address: chain?.feeDistributor as `0x${string}`,
        chainId: chain?.id,
        functionName: 'getTokensDistributedInWeek',
          args: [WETH_ADDRESS as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: FeeDistributorAbi,
        address: chain?.feeDistributor as `0x${string}`,
        chainId: chain.id,
        functionName: 'getTokensDistributedInWeek',
        args: [chain?.address as `0x${string}`, BigInt(`${previousWeekUnix}`)],
      },
      {
        abi: veNFTEAbi,
        address: chain?.veNFTE as `0x${string}`,
        functionName: 'totalSupply',
        chainId: chain?.id,
      },
    ],
    allowFailure: true,
    watch: false,
    keepPreviousData: true
  })

  const [distributedWeth, distributedNFTE, totalSupplyXNfte,] = data || []

  const { data: wethPrice, isLoading: isLoadingWethPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: distributedWeth?.result || BigInt(0)
  })

  const { data: nftePrice, isLoading: isLoadingNFTEPrice } = useUSDAndNativePrice({
    chainId: base.id,
    contract: chain.address,
    price: distributedNFTE?.result || BigInt(0)
  })}

export {}