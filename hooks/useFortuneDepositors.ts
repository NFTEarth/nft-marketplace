import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

export type Depositor = {
  address: `0x${string}`
  biggestETHWon: bigint
  biggestROI: number
  totalRoundsWon: number
  totalRoundsPlayed: number
}

type DepositorsResult = {
  depositors: Depositor[]
}

const useFortuneRound = (userAddresses?: `0x${string}`[], options?: SWRConfiguration) => {
  const { data, isLoading } = useSWR<DepositorsResult>(
    userAddresses ? [
    `query GetDepositors($userAddresses: [String]!) {
      depositors(where: { address_in: $userAddresses }) {
        address
        biggestETHWon
        biggestROI
        totalRoundsWon
        totalRoundsPlayed
      }
    }
  `,
      {
        userAddresses
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
    data: data?.depositors,
    isLoading
  };
}

export default useFortuneRound;