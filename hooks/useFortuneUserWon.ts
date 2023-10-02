import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {Round} from "./useFortuneRound";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

type WinningRoundResult = {
  winningRounds: Round[]
}

const useFortuneUserWon = (user?: `0x${string}`, options?: SWRConfiguration) => {
  const { data, isLoading, mutate } = useSWR<WinningRoundResult>(
    user ? [
    `query GetUserWonRounds($user: String!) {
        winningRounds:rounds(orderBy: roundId, orderDirection: desc, first: 1000, where: { winner: $user }) {
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
          deposits(orderBy: indice, orderDirection: asc, first: 1000, where: { claimed: false }) {
            id
            depositor
            tokenAddress
            tokenAmount
            tokenId
            tokenType
            entriesCount
            indice
            claimed
          }
        }
      }`,
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
    data: data?.winningRounds as Round[],
    refetch: mutate,
    isLoading
  };
}

export default useFortuneUserWon;