import type { NextApiRequest, NextApiResponse } from 'next';
import ethers, {AlchemyProvider, Contract, parseEther} from 'ethers'

import { FORTUNE_CHAINS } from 'utils/chains'
import FortuneAbi from 'artifact/FortuneAbi.json'

export default function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  if (request.headers.origin !== process.env.NEXT_PUBLIC_HOST_URL) {
    console.error(`${request.headers.origin} Not Allowed`)

    response.status(404).end();
    return;
  }

  const chain = FORTUNE_CHAINS[0]
  const provider = new AlchemyProvider("arbitrum", process.env.NEXT_PUBLIC_ALCHEMY_ID);
  const signer = new ethers.Wallet(process.env.SIGNER_PKEY as string, provider);
  const fortune = new Contract(chain.address, FortuneAbi, signer)

  const data = fortune.roundsCount();

  console.log('Requested', data)

  response.status(200).json({ success: true });
}