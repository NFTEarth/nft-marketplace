import useSWR, {SWRConfiguration} from "swr";

export default function useMerklReward(chainId: number, address: string | undefined, options?: SWRConfiguration) {
  const { data, mutate, isValidating, isLoading } = useSWR(
    (address && address !== '' ) ? `https://api.angle.money/v1/merkl?chainId=${chainId}&user=${address}` :  null,
    (url: string) => {
      if (!address) {
        return null
      }
      return fetch(url).then((response) => response.json())
    },
    {
      revalidateOnFocus: true,
      revalidateIfStale: true,
      revalidateOnReconnect: true,
      ...options
    }
  )

  return {
    data,
    mutate,
    isValidating,
    isLoading
  };
}
