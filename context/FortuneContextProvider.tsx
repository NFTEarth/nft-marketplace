import { useState, createContext, FC } from 'react'
import {PlayerType} from "../components/fortune/Player";
import {PrizeType} from "../components/fortune/Prize";

export const FortuneContext = createContext<{
  data: {
    status: number
    durationLeft: number
    winner: `0x${string}` | null
    players: PlayerType[]
    prizes: PrizeType[]
    enableAudio: boolean
    hoverPlayerIndex?: number
    usdConversion: number
  }
  functions: {
    setStatus: ((status: number) => void) | null
    setWinner: ((winner: `0x${string}`) => void) | null
    setDurationLeft: ((status: number) => void) | null
    setPlayers: ((players: PlayerType[]) => void) | null
    setPrizes: ((prizes: PrizeType[]) => void) | null
    setEnableAudio: ((enableAudio: boolean) => void) | null
    setUSDConversion: ((usdConversion: number) => void) | null
    setHoverPlayerIndex: ((playerIndex?: number) => void) | null
  }
}>({
  data: {
    status: 0,
    winner: null,
    durationLeft: 0,
    enableAudio: false,
    players: [],
    prizes: [],
    usdConversion: 0
  },
  functions: {
    setStatus: null,
    setWinner: null,
    setEnableAudio: null,
    setDurationLeft: null,
    setPlayers: null,
    setPrizes: null,
    setHoverPlayerIndex: null,
    setUSDConversion: null,
  }
})

const FortuneContextProvider: FC<any> = ({ children }) => {
  const [status, setStatus] = useState(0)
  const [usdConversion, setUSDConversion] = useState(0)
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
          usdConversion
        },
        functions: {
          setStatus,
          setPlayers,
          setWinner,
          setPrizes,
          setEnableAudio,
          setDurationLeft,
          setHoverPlayerIndex,
          setUSDConversion
        }
      }}
    >
      {children}
    </FortuneContext.Provider>
  )
}

export default FortuneContextProvider
