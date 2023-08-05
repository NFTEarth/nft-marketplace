import type {NextApiRequest, NextApiResponse} from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chain, contract, token_id } = req.query;

  const headers = new Headers();
  headers.set('Content-Type', 'application/json')
  headers.set('x-api-key', process.env.NEXT_PUBLIC_SIMPLEHASH_API_KEY as string)

  const response = await fetch(`${process.env.NEXT_PUBLIC_SIMPLEHASH_API_BASE}/api/v0/nfts/${chain}/${contract}/${token_id}`, {
    headers
  }).then(res => res.json())
    .catch(() => null);

  res.json(response);
}