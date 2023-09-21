import db  from "lib/db";
import type {NextApiRequest, NextApiResponse} from "next";

const questEntry = db.collection('quest_entry');
const account = db.collection('account');

const questEntryListHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { wallet } = req.query;

  if (!wallet) {
    return res.json({
      status: 'ERROR',
      code: 408,
      message: 'Invalid session, please reconnect your wallet'
    })
  }

  const accountData = await account.findOne({
    wallet: {
      $regex: wallet,
      $options: 'i'
    }
  })

  const cursor = await questEntry.find( {
    account_id: accountData?._id.toString()
  });

  const questList = (await cursor.toArray()) || [];

  res.status(200).json(questList);
}

export default questEntryListHandler;