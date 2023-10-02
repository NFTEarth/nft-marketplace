import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url)
    .then((r) => r.json())

function useRaffle(id: number | string) {
  const {data, error} = useSWR(`/api/raffle?id=${id}`, fetcher)

  return error ? null : data;
}

export default useRaffle;
