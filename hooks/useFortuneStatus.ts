import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {Round} from "./useFortuneRound";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

export type FortuneStatus = {
  totalRounds: bigint
  currentRound: Round
}

type FortuneStatusResult = {
  fortune: FortuneStatus
}

const useFortuneStatus = (options?: SWRConfiguration) => {
  const { data, isLoading, isValidating, mutate } = useSWR<FortuneStatusResult>(
    [
      `query GetFortune {
        fortune(id: "nftearth") {
          totalRounds
          currentRound {
            roundId
            status
          }
        }
      }`,
      {}
    ],
    subgraphFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      ...options
    }
  )

  return {
    data: data?.fortune,
    mutate,
    isLoading: isLoading || isValidating
  };
}

export default useFortuneStatus;