import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers, AlchemyProvider, Contract} from 'ethers'

import { FORTUNE_CHAINS } from 'utils/chains'
import FortuneAbi from 'artifact/FortuneAbi'

const chain = FORTUNE_CHAINS[0]
const provider = new AlchemyProvider(42161, process.env.NEXT_PUBLIC_ALCHEMY_ID);
const signer = new ethers.Wallet(process.env.SIGNER_PKEY as string, provider);

export default async function handler(
  request: NextApiRequest,
  response: NextApiResponse,
) {
  // if (request.headers.origin !== process.env.NEXT_PUBLIC_HOST_URL) {
  //   console.error(`${request.headers.origin} Not Allowed`)
  //
  //   response.status(404).end();
  //   return;
  // }

  const fortune = new Contract(chain.address, FortuneAbi, signer)

  const roundId = await fortune.roundsCount();
  const round = await fortune.rounds(roundId);
  const timestamp = Math.round((new Date()).getTime() / 1000)

  // Enable when we ready
  if (BigInt(timestamp) >= BigInt(round.cutoffTime)) {
    if (round.numberOfParticipants > 1) {
      console.log(`Round ${roundId} Drawing Winner`)
      await fortune.drawWinner()
    } else {
      console.log(`Round ${roundId} Canceled, New Round ID : ${roundId + BigInt(1)}`)
      await fortune.cancel()
    }
  }

  response.status(200).json({ success: true });
}