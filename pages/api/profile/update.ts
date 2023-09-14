import type {NextApiRequest, NextApiResponse} from "next";
import {AuthOptions, getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";
import db from "lib/db";

const account = db.collection('account')

const handleProfileUpdate = async (req: NextApiRequest, res: NextApiResponse) => {
  const session: any = await getServerSession(req, res, authOptions as AuthOptions);

  if (!session) {
    return res.json({
      status: 'ERROR',
      code: 408,
      message: 'Invalid session, please retry',
    })
  }

  const accountData = await account.findOne({
    wallet: {
      $regex: session.wallet,
      $options: 'i'
    }
  });

  if (!accountData) {
    return res.json({
      status: 'ERROR',
      code: 408,
      message: 'Invalid session, please re-login',
    })
  }

  await account.updateOne({
    wallet: session.wallet
  }, {
    $set: {
      ...req.body
    }
  });

  return res.json({
    status: 'SUCCESS',
    message: 'Profile Updated'
  })
}

export default handleProfileUpdate;