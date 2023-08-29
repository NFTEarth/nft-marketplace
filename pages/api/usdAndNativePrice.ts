import {NextApiRequest, NextApiResponse} from "next";
import {getUSDAndNativePrices} from "../../utils/price";

const usdAndNativePrice = async (req: NextApiRequest, res: NextApiResponse) => {
  const { contract, chain, price } = req.query;
  const data = await getUSDAndNativePrices(
    contract as `0x${string}`,
    +`${chain}`,
    price as string,
    ((new Date()).getTime() / 1000) - 3600)

  return res.json(data || null)
}

export default usdAndNativePrice;