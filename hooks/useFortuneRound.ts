import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";
import {TokenType} from "../components/fortune/Prize";
export type Entry = {
  totalNumberOfEntries: number
}

export enum RoundStatus {
  None,
  Open,
  Drawing,
  Drawn,
  Cancelled
}

export type Deposit = {
  id: string
  depositor: string
  tokenAddress: string
  tokenAmount: number
  tokenId: number
  tokenType: TokenType
  numberOfEntries: number
  indice: number
  claimed: boolean
  entry: Entry
}

export type Round = {
  id: string
  roundId: number
  status: RoundStatus
  cutoffTime: number
  maximumNumberOfDeposits: number
  maximumNumberOfParticipants: number
  valuePerEntry: number
  numberOfEntries: number
  numberOfParticipants: number
  winner: string
  drawnHash: string
  protocolFeeBp: number
  deposits: Deposit[]
}

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

type RoundResult = {
  round: Round
}

const useFortuneRound = (roundId?: number, options?: SWRConfiguration) => {
  const { data, isLoading } = useSWR<RoundResult>(
    roundId ? [
      `query GetRound($id: ID!) {
        round(id: $id) {
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
      {
        id: roundId
      }
    ] : null,
    subgraphFetcher,
    {
      revalidateOnFocus: true,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  )

  return {
    data: data?.round as Round,
    isLoading
  };
}

export default useFortuneRound;