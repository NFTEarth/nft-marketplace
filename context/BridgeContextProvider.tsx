import { useState, createContext, FC, useEffect } from 'react'
import { isAddress } from 'viem'

type CachedReferrer = { referrer: string; date: string }

export const BridgeRouterContext = createContext<{
  feesOnTop?: string[]
}>({
  feesOnTop: undefined,
})

const REFERRER_CACHE_KEY = 'reservoir.referrer'
const REFERRAL_FEE_USD = 1000000

const BridgeContextProvider: FC<any> = ({ children }) => {
  const [feesOnTop, setFeesOnTop] = useState<string[] | undefined>()

  return (
    <BridgeRouterContext.Provider value={{ feesOnTop }}>
      {children}
    </BridgeRouterContext.Provider>
  )
}

export default BridgeContextProvider
