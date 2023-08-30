import {request, RequestDocument, Variables} from 'graphql-request'
import useSWR, {SWRConfiguration} from "swr";

const subgraphFetcher = <T>([query, variables]: [RequestDocument, Variables]) =>
  request<T>('https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune', query, variables)

export type FortuneCurrency = {
  address: `0x${string}`
  isAllowed: boolean
}

type FortuneStatusResult = {
  currencies: FortuneCurrency[]
}

const useFortuneCurrencies = (options?: SWRConfiguration) => {
  const { data, isLoading, mutate } = useSWR<FortuneStatusResult>(
    [
      `query GetAllowedCurrency {
        currencies (where:{ isAllowed:true }) {
          id
          address
          isAllowed
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
    data: data?.currencies,
    mutate,
    isLoading
  };
}

export default useFortuneCurrencies;