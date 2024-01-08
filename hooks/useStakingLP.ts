import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.studio.thegraph.com/query/16559/venfte/v0.0.1', query, variables)

export type NFTELPToken = {
  id: `0x${string}`
  name: string
  symbol: string
  totalSupply: bigint
  totalStaked: bigint
  numHolders: number
}

type StakingDepositorResult = {
  nftelptoken: NFTELPToken
}

const useStakingDepositor = (address?: `0x${string}`, options?: SWRConfiguration) => {
  const { mutate, data, isLoading } = useSWR<StakingDepositorResult>(
    address ? [
    `query GetStakingLP($address: String!) {
       nftelptoken(id: $address) {
          id
          name
          symbol
          totalSupply
          totalStaked
          numHolders
        }
      }`,
      {
        address: address.toLowerCase()
      }
    ] : null,
    subgraphFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...options
    }
  )

  return {
    data: data?.nftelptoken as NFTELPToken,
    mutate,
    isLoading
  };
}

export default useStakingDepositor;