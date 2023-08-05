import useSWR from "swr";

export default function ({ chain, contract, tokenId } : { chain: string, contract: string, tokenId: string }) {
  return useSWR(
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
