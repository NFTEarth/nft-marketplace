import {request, RequestDocument} from 'graphql-request'
import useSWR from "swr";
import {Round} from "./useFortuneRound";

const subgraphFetcher = <T>(query: RequestDocument) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query)

type RoundResult = {
  rounds: Round[]
}

const useFortuneCurrentRound = () => {
  const { data, isLoading } = useSWR<RoundResult>(
    `query GetCurrentRound {
        rounds(orderBy: roundId, orderDirection: desc, first: 1) {
          id
          roundId
          status
          cutoffTime
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
            entry {
              totalNumberOfEntries
            }
          }
        }
      }`,
    subgraphFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data: data?.rounds?.[0],
    isLoading
  };
}

export default useFortuneCurrentRound;