import {NextApiRequest, NextApiResponse} from "next";

const COLLECTIONS = [
  {
    '1': '0x78c34e3493d2ab0bcdef7017b09a8946af94076e',
    '10': '0x78c34e3493d2ab0bcdef7017b09a8946af94076e'
  } 
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { chainId, contract } = req.query;
  
  const collection = COLLECTIONS.find((c: any) => c[chainId as string] === contract) || {
    '1': null,
    '10': null
  };
  
  return res.json(collection[chainId === '1' ? '10' : '1']);
}