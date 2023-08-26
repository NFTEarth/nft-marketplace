import { useState, createContext, FC, useEffect } from 'react'
import {PlayerType} from "../components/fortune/Player";
import {PrizeType} from "../components/fortune/Prize";
import {parseEther} from "ethers/lib/utils";
import {AddressZero} from "@ethersproject/constants";

export const FortuneContext = createContext<{
  data: {
    status: number
    durationLeft: number
    winner: `0x${string}` | null
    players: PlayerType[]
    prizes: PrizeType[]
    enableAudio: boolean
    hoverPlayerIndex?: number
    yourEntriesEth?: BigInt
    yourEntriesCount?: number
  }
  functions: {
    setStatus: ((status: number) => void) | null
    setWinner: ((winner: `0x${string}`) => void) | null
    setDurationLeft: ((status: number) => void) | null
    setPlayers: ((players: PlayerType[]) => void) | null
    setPrizes: ((prizes: PrizeType[]) => void) | null
    setEnableAudio: ((enableAudio: boolean) => void) | null
    setHoverPlayerIndex: ((playerIndex?: number) => void) | null
    setYourEntriesEth: ((entriesEth: bigint) => void) | null
    setYourEntriesCount: ((status: number) => void) | null
  }
}>({
  data: {
    status: 0,
    winner: null,
    durationLeft: 0,
    yourEntriesEth: BigInt(0),
    yourEntriesCount: 0,
    enableAudio: false,
    players: [],
    prizes: [],
  },
  functions: {
    setStatus: null,
    setWinner: null,
    setEnableAudio: null,
    setDurationLeft: null,
    setPlayers: null,
    setPrizes: null,
    setYourEntriesEth: null,
    setYourEntriesCount: null,
    setHoverPlayerIndex: null
  }
})

const FortuneContextProvider: FC<any> = ({ children }) => {
  const [status, setStatus] = useState(0)
  const [yourEntriesEth, setYourEntriesEth] = useState(BigInt(0))
  const [yourEntriesCount, setYourEntriesCount] = useState(0)
  const [winner, setWinner] = useState<`0x${string}` | null>(null)
  const [enableAudio, setEnableAudio] = useState(false)
  const [players, setPlayers] = useState<PlayerType[]>([])
  const [prizes, setPrizes] = useState<PrizeType[]>([])
  const [durationLeft, setDurationLeft] = useState(60 * 5)
  const [hoverPlayerIndex, setHoverPlayerIndex] = useState<number | undefined>(undefined)

  return (
    <FortuneContext.Provider
      value={{
        data: {
          status,
          players,
          prizes,
          winner,
          enableAudio,
          durationLeft,
          hoverPlayerIndex,
          yourEntriesEth,
          yourEntriesCount
        },
        functions: {
          setStatus,
          setPlayers,
          setWinner,
          setPrizes,
          setEnableAudio,
          setDurationLeft,
          setHoverPlayerIndex,
          setYourEntriesEth,
          setYourEntriesCount
        }
      }}
    >
      {children}
    </FortuneContext.Provider>
  )
}

export default FortuneContextProvider
