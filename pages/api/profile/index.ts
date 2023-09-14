import {NextApiRequest, NextApiResponse} from "next";
import db from "lib/db";

const account = db.collection('account')

const handleProfile = async (req: NextApiRequest, res: NextApiResponse) => {
  const { address } = req.query;

  if (!address) {
    return res.json({
      status: 'ERROR',
      code: 408,
      message: 'Invalid session, please reconnect your wallet',
    })
  }

  const accountData = await account.findOne({
    wallet: {
      $regex: address,
      $options: 'i'
    }
  }, {
    projection: {
      twitter_oauth_token: 0,
      twitter_oauth_token_secret: 0,
      discord_code: 0,
      discord_refresh_token: 0,
      discord_access_token: 0
    }
  }).catch(() => ({
    error: 'Unknown Error'
  }))

  return res.json(accountData || null)
}

export default handleProfile;