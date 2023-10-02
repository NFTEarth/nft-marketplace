import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())

function useRaffleHistory(id: string, address: string | undefined) {
  const {data, error, isValidating} = useSWR(address ? `/api/raffle/history?id=${id}&address=${address}` : null, fetcher)

  return error ? null : {
    data: data?.logs,
    isValidating
  };
}

export default useRaffleHistory;
