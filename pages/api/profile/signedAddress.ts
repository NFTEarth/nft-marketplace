import type {NextApiRequest, NextApiResponse} from "next";
import {AuthOptions, getServerSession} from "next-auth";
import {authOptions} from "../auth/[...nextauth]";

const signedAddressHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const session: any = await getServerSession(req, res, authOptions as AuthOptions);

  return res.json({
    wallet: session.wallet
  })
}

export default signedAddressHandler;