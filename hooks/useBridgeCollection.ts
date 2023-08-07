import useSWR from "swr";

export default function ({ dstChainId, contract } : { dstChainId: number, contract: string, tokenId: string }) {
  return useSWR(
    `/api/bridge/collection?dstChainId=${dstChainId}&contract=${contract}`,
    (url: string) => {
      if (!dstChainId || !contract) {
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
