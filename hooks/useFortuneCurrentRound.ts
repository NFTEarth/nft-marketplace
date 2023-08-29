import {request, RequestDocument} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {Round} from "./useFortuneRound";
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

const subgraphFetcher = <T>(query: RequestDocument) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query)

type RoundResult = {
  rounds: Round[]
}

const useFortuneCurrentRound = (options?: SWRConfiguration) => {
  const { data, mutate, isLoading } = useSWR<RoundResult>(
    `query GetCurrentRound {
        rounds(orderBy: roundId, orderDirection: desc, first: 1) {
          id
          roundId
          status
          cutoffTime
          duration
          maximumNumberOfDeposits
          maximumNumberOfParticipants
          valuePerEntry
          numberOfEntries
          numberOfParticipants
          winner
          protocolFeeBp
          deposits(orderBy: indice, orderDirection: asc, first: 1000) {
            id
            depositor
            tokenAddress
            tokenAmount
            tokenId
            tokenType
            numberOfEntries
            indice
            claimed
            participant {
              totalNumberOfEntries
            }
          }
        }
      }`,
    subgraphFetcher,
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      revalidateOnMount: false,
      ...options
    }
  )

  return {
    data: data?.rounds?.[0],
    refetch: mutate,
    isLoading
  };
}

export default useFortuneCurrentRound;