import {NextApiRequest, NextApiResponse} from "next";

const COLLECTIONS = [
  {
    '1': '0x78c34e3493d2ab0bcdef7017b09a8946af94076e',
    '10': '0x78c34e3493d2ab0bcdef7017b09a8946af94076e'
  },
  {
    '1': '0xd955e7bd8ca9f2aad391760f849cfa4ee2d80d57',
    '10': '0xd955e7bd8ca9f2aad391760f849cfa4ee2d80d57'
  }
]

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { dstChainId, contract } = req.query;
  
  const collection = COLLECTIONS.find((c: any) => c[dstChainId as string] === contract) || {
    '1': null,
    '10': null
  };
  
  return res.json(collection);
}