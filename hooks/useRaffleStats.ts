import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())

function useRaffleStats(id: string, address: string | undefined) {
  const {data, error} = useSWR(address ? `/api/raffle/stats?id=${id}&address=${address}` : null, fetcher)

  return error ? null : data?.stats;
}

export default useRaffleStats;
