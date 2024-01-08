import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {NFTELPToken} from "./useStakingLP";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.studio.thegraph.com/query/16559/venfte/v0.0.1', query, variables)

export type StakingDepositor = {
  id: `0x${string}`
  token?: NFTELPToken
  totalBalance: bigint
  lockedBalance?: bigint
  lockStartTimestamp?: bigint
  lockEndTimestamp?: bigint
}

type StakingDepositorResult = {
  depositor: StakingDepositor
}

const useStakingDepositor = (user?: `0x${string}`, options?: SWRConfiguration) => {
  const { mutate, data, isLoading } = useSWR<StakingDepositorResult>(
    user ? [
    `query GetStakingDepositor($user: String!) {
       depositor(id: $user) {
          id
          totalBalance
          lockedBalance
          lockStartTimestamp
          lockEndTimestamp
        }
      }`,
      {
        user: user.toLowerCase()
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
    data: data?.depositor as StakingDepositor,
    mutate,
    isLoading
  };
}

export default useStakingDepositor;