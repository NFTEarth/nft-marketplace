import {ethers} from "ethers";
import {paths} from "@reservoir0x/reservoir-sdk";
import fetcher from "utils/fetcher";
import supportedChains, {OFT_CHAINS} from "utils/chains";
import db from "lib/db";
import {getUSDAndNativePrices, USDAndNativePrices} from "../utils/price";
import {AddressZero} from "@ethersproject/constants";
import {BigNumber} from "@ethersproject/bignumber";
import {formatEther} from "viem";

let lastUpdate = (new Date()).getTime();
const EXTRA_REWARD_PER_PERIOD=0.00001
const aMonth = 60 * 24 * 30

const entry = db.collection('quest_entry')
type Collection = {
  floorAsk: number | undefined
  topBid: number | undefined
  reward: number
}
type CollectionReward = Record<string, Collection | undefined>
const collectionReward: Record<number, CollectionReward | undefined> = {
  10: undefined,
  42161: undefined,
  8453: undefined
}

const fetchCollection =  async (chainId: number, continuation: string | undefined) => {
  const chain = supportedChains.find(c => c.id === chainId)
  const collectionQuery: paths["/collections/v5"]["get"]["parameters"]["query"] = {
    includeTopBid: true,
    sortBy: 'allTimeVolume',
    limit: 20,
    continuation
  }

  const { data } = await fetcher(`${chain?.reservoirBaseUrl}/collections/v5`, collectionQuery, {
    headers: {
      'x-api-key': chain?.apiKey || '',
    }
  })

  return data
}

const fetchNFTEToEthValue =  async (chainId: number): Promise<USDAndNativePrices> => {
  const chain = OFT_CHAINS.find(c => c.id === chainId)
  const NFTEAddress = chain?.address || AddressZero
  const date = new Date()

  return getUSDAndNativePrices(NFTEAddress,
    chainId,
    '1',
    Math.floor(date.valueOf() / 1000),
    {
      acceptStalePrice: true
    })
}

const getRewardForRank = (rank: number) => {
  if (rank <= 10) {
    return 100
  }

  if (rank <= 50) {
    return 75
  }

  if (rank <= 75) {
    return 50
  }

  if (rank <= 100) {
    return 25
  }

  return 0
}

const fetchCollectionRankReward = async (chainId: number, collectionId: string) => {
  const currentTime = (new Date()).getTime();
  // Fetch Rank Daily
  if (collectionReward[chainId] && (lastUpdate + (1000 * 60 * 24)) > currentTime) {
    return collectionReward[chainId]?.[collectionId.toLowerCase()] || {
      floorAsk: 0,
      topBid: 0,
      reward: 0
    }
  }

  let i = 0
  let continuation: string | undefined = undefined

  collectionReward[chainId] = {}

  while (i < 100) {
    const result: any = await fetchCollection(chainId, continuation)

    result.collections.forEach((collection: any, j: number) => {
      // @ts-ignore
      collectionReward[chainId][collection.id.toLowerCase()] = {
        floorAsk: +collection.floorAsk?.price?.amount?.native,
        topBid: +collection.topBid?.price?.amount?.native,
        reward: getRewardForRank(i + j + 1)
      }
    })

    continuation = result.continuation
    i += 20
  }

  lastUpdate = currentTime

  return collectionReward[chainId]?.[collectionId]
}

type CalculateReward = (
  chainId: number,
  account: string,
  collectionId: string,
  paymentToken: string,
  amount: string,
  period: number,
  isListing: boolean
) => Promise<number>

export const calculateReward: CalculateReward = async (chainId, account, collectionId, paymentToken, amount, period, isListing)  => {
  const chain = OFT_CHAINS.find(c => c.id === chainId)
  const isNFTE = paymentToken === chain?.address
  let value = +formatEther(BigInt(`${+amount || 0}`)).toString()

  if (!account) {
    return 0;
  }

  if (isNFTE) {
    const nfteToNative = await fetchNFTEToEthValue(chainId).catch(() => ({ nativePrice: 0 }))
    value = BigNumber.from(value).mul(BigNumber.from(nfteToNative?.nativePrice)).toNumber()
  }

  const questEntry = (await entry.findOne({
    wallet: {
      $regex: account,
      $options: 'i'
    }
  }).catch(() => null)) || []

  const collection = await fetchCollectionRankReward(chainId, collectionId)

  let reward = 0

  if (collection) {
    reward = collection.reward
    const topBidValue = +`${collection.topBid}`
    const floorValue = +`${collection.floorAsk}`
    const tokenValue = floorValue || topBidValue || 0
    const percentDiff = (tokenValue - value) / ((tokenValue + value) / 2)

    period = period > aMonth ? aMonth : period
    reward += reward * (period * EXTRA_REWARD_PER_PERIOD)

    if (isListing) {
      reward += (reward * percentDiff)
    } else {
      reward -= (reward * percentDiff)
    }

    if (reward < 0 || value <= 0 || questEntry.length < 7) {
      reward = 0
    }

    console.info(`New Reward`, {
      chainId,
      account,
      tokenValue,
      value,
      percentDiff,
      reward,
      isNFTE,
      isListing
    })
  }

  return reward * (isNFTE ? 2 : 1)
}