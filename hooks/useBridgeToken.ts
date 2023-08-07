import useSWR from "swr";
import {definitions} from "@reservoir0x/reservoir-sdk";

export default function ({ chain, contract, tokenId } : { chain: number, contract: string, tokenId: string }) {
  return useSWR<definitions["Model82"] | null>(
    `/api/bridge/token?chain=${chain}&contract=${contract}&token_id=${tokenId}`,
    (url: string) => {
      if (!chain || !contract || !tokenId) {
        return null
      }
      return fetch(url).then((response) => response.json())
    },
    {
      revalidateOnFocus: false,
      revalidateIfStale: false,
      revalidateOnReconnect: false,
    }
  )
}
