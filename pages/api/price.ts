import {NextApiRequest, NextApiResponse} from "next";

const cache: Record<string, number> = {}

async function NFTEOFTPrice(req: NextApiRequest, res: NextApiResponse) {
  const date = new Date()
  const day = date.getDate();
  const month = date.getMonth() + 1;
  const year = date.getFullYear();

  if (cache[`${day}-${month}-${year}`]) {
    return res.json({ price: cache[`${day}-${month}-${year}`] })
  }

  const result = await fetch(`https://api.coingecko.com/api/v3/coins/nftearth/history?date=${day}-${month}-${year}`, {
    headers: {
      'Content-Type': 'application/json'
    },
  })
  const data = await result.json()

  cache[`${day}-${month}-${year}`] = data?.market_data?.current_price?.usd

  return res.json({ price: data?.market_data?.current_price?.usd })
}

export default NFTEOFTPrice;