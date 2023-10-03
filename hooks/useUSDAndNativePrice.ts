import useSWR, {SWRConfiguration} from "swr";
import {USDAndNativePrices} from "../utils/price";

export default function ({ enabled = true, chainId, contract, price } : { enabled?: boolean, chainId: number, contract: string, price: bigint }, options? : SWRConfiguration ) {
  return useSWR(
    enabled ? `/api/usdAndNativePrice?chain=${chainId}&contract=${contract}&price=${price}` : null,
    (url: string) => {
      if (!chainId || !contract || !price) {
        return null
      }
      return fetch(url).then((response) => response.json() as USDAndNativePrices)
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
      ...options
    }
  )
}
