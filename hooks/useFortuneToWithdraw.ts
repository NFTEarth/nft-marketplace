import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {Deposit} from "./useFortuneRound";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

type DepositsResult = {
  deposits: Partial<Deposit>[]
}

const useFortuneToWithdraw = (user?: `0x${string}`, options?: SWRConfiguration) => {
  const { data, isLoading, mutate } = useSWR<DepositsResult>(
    user ? [
      ` query GetUserDepositsToWithdraw($user: String!) {
          deposits(first: 1000, where: { depositor: $user, round_: { status: 4 }, claimed: false }) {
            round {
              roundId
              valuePerEntry
            }
            entriesCount
            indice
          }
        }
      `,
      {
        user
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
    data: data?.deposits as Deposit[],
    refetch: mutate,
    isLoading
  };
}

export default useFortuneToWithdraw;