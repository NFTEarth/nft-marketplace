import {request, RequestDocument} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {Round} from "./useFortuneRound";
import fa from "@walletconnect/legacy-modal/dist/cjs/browser/languages/fa";

const subgraphFetcher = <T>(query: RequestDocument) =>
  request<T>(`${process.env.NEXT_PUBLIC_HOST_URL}/api/subgraph/nftearth/fortune/api`, query)

type RoundResult = {
  rounds: Round[]
}

const useFortuneCurrentRound = (options?: SWRConfiguration) => {
  const { data, mutate, isLoading } = useSWR<RoundResult>(
    `query GetCurrentRound {
        rounds(orderBy: roundId, orderDirection: desc, first: 1) {
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
            entriesCount
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
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      revalidateOnMount: true,
      ...options
    }
  )

  return {
    data: data?.rounds?.[0],
    mutate,
    isLoading
  };
}

export default useFortuneCurrentRound;