import useSWR, {SWRConfiguration} from "swr";

export default function useProfile(username: string | undefined, options?: SWRConfiguration) {
  const { data, isLoading } = useSWR(
    (username && username !== '' ) ? `/api/profile/check?username=${username}` :  null,
    (url: string) => {
      if (!username) {
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
    isLoading
  };
}
