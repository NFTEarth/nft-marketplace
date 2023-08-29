import useSWR, {SWRConfiguration} from "swr";

export default function ({ chainId, contract, price } : { chainId: number, contract: string, price: bigint }, options? : SWRConfiguration ) {
  return useSWR(
    `/api/usdAndNativePrice?chain=${chainId}&contract=${contract}&price=${price}`,
    (url: string) => {
      if (!chainId || !contract || !price) {
        return null
      }
      return fetch(url).then((response) => response.json())
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...options
    }
  )
}
