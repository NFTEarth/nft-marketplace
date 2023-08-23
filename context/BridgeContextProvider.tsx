import { useState, createContext, FC, useEffect } from 'react'

export const BridgeRouterContext = createContext<{
  feesOnTop?: string[]
}>({
  feesOnTop: undefined,
})

const BridgeContextProvider: FC<any> = ({ children }) => {
  const [feesOnTop, setFeesOnTop] = useState<string[] | undefined>()

  return (
    <BridgeRouterContext.Provider value={{ feesOnTop }}>
      {children}
    </BridgeRouterContext.Provider>
  )
}

export default BridgeContextProvider
