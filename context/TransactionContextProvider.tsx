import {
  useState,
  createContext,
  SetStateAction,
  Dispatch,
  FC,
  ReactNode,
  useEffect,
} from 'react'
import { v4 as uuidv4 } from 'uuid'
import { Execute } from '@reservoir0x/reservoir-sdk'
import { useNetwork } from 'wagmi'

type TransactionType = {
  chainId: number;
  hash: string;
  from: string;
  approval?: { tokenAddress: string; spender: string };
  summary?: string;
}

export interface SerializableTransactionReceipt {
  to: string;
  from: string;
  contractAddress: string;
  transactionIndex: number;
  blockHash: string;
  transactionHash: string;
  blockNumber: number;
  status?: number;
}

export const TransactionContext = createContext<{
  transactions: Array<TransactionType>
  setTransactions: Dispatch<SetStateAction<Array<TransactionType>>> | null
  addTransaction: ((toast: TransactionType) => void) | null
}>({
  transactions: [],
  setTransactions: null,
  addTransaction: null,
})

const TransactionContextProvider: FC<any> = ({ children }) => {
  const [transactions, setTransactions] = useState<Array<TransactionType>>([])

  const { chains } = useNetwork()

  const addTransaction = (transaction: {
    chainId: number;
    hash: string;
    from: string;
    approval?: { tokenAddress: string; spender: string };
    summary?: string;
  }) => {
    setTransactions([...transactions, transaction])
  }

  const finalizeTransaction = (
    chainId: number,
    hash: string,
    receipt: SerializableTransactionReceipt
  ) => {

  }

  const checkedTransaction = (
    chainId: number,
    hash: string,
    blockNumber: number,
  ) => {

  }

  return (
    <TransactionContext.Provider value={{ transactions, addTransaction, setTransactions }}>
      {children}
    </TransactionContext.Provider>
  )
}

export default TransactionContextProvider
