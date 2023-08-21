import useSWR from "swr";

export default function useProfile(address: string | undefined) {
  const { data, isLoading } = useSWR(
    (address && address !== '' ) ? `/api/profile?address=${address}` :  null,
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
    }
  )

  return {
    data,
    isLoading
  };
}
