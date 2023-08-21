import {NextApiRequest, NextApiResponse} from "next";
import db from "lib/db";

const account = db.collection('account')

const handleQuestRegister = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wallet } = req.query;

  const existingAccount = await account.findOne({
    wallet: (wallet as string).toLowerCase()
  }).catch(() => null);

  if (!existingAccount) {
    await account.insertOne({
      wallet: (wallet as string).toLowerCase(),
      exp: 0
    })
  }

  return res.json({
    code: 200,
    message: "SUCCESS"
  })
}

export default handleQuestRegister;