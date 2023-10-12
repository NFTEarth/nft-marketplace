import NextAuth, {NextAuthOptions} from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import {getAddress} from "viem";
import db from "lib/db";

const user = db.collection('account');

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        wallet: {
          label: 'Wallet',
          type: 'text',
          placeholder: '0x0',
        },
      },
      authorize(credentials, req) {
        if (!getAddress(credentials?.wallet || '')) {
          return null
        }

        return new Promise(async (resolve, reject) => {
          const userData = await user.findOne({
            wallet: credentials?.wallet
          })

          if (!userData) {
            await user.insertOne({
              wallet: credentials?.wallet
            })
          }

          resolve({
            id: credentials?.wallet || '',
          })
        })
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60,
  },
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  callbacks: {
    async session({ session, token }) {
      // @ts-ignore
      session.wallet = token.sub
      session.expires
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
    signOut: '/',
    error: '/',
    newUser: '/',
  },
};

export default NextAuth(authOptions);