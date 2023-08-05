import useSWR from "swr";

export default function ({ chainId, contract } : { chainId: number, contract: string, tokenId: string }) {
  return useSWR(
    `/api/bridge/collection?chainId=${chainId}&contract=${contract}`,
    (url: string) => {
      if (!chainId || !contract) {
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
