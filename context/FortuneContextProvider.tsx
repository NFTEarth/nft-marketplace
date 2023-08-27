import {useState, createContext, FC, useReducer, Dispatch} from 'react'
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
    setPlayers: Dispatch<PlayerAction> | null
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

type PlayerResetAction = {
  type: 'reset'
}

type PlayerUpdateAction = {
  type: 'update'
  index: number
  payload: PlayerType
}

type PlayerAddAction = {
  type: 'add'
  payload: PlayerType
}

type PlayerSetAction = {
  type: 'set'
  payload: PlayerType[]
}

type PlayerAction = PlayerResetAction | PlayerAddAction | PlayerUpdateAction | PlayerSetAction

const FortuneContextProvider: FC<any> = ({ children }) => {
  const [status, setStatus] = useState(0)
  const [usdConversion, setUSDConversion] = useState(0)
  const [winner, setWinner] = useState<`0x${string}` | null>(null)
  const [enableAudio, setEnableAudio] = useState(false)
  const [prizes, setPrizes] = useState<PrizeType[]>([])
  const [durationLeft, setDurationLeft] = useState(60 * 5)
  const [hoverPlayerIndex, setHoverPlayerIndex] = useState<number | undefined>(undefined)
  const playerReducer = (state: PlayerType[], action: PlayerAction): PlayerType[] => {
    switch (action.type) {
      case "add":
        return [...state, action.payload]
      case "update":
        return state.map((player: PlayerType) => {
          if (player.index === action.index) {
            return { ...player, ...action.payload };
          } else {
            return player;
          }
        });
      case "set":
        return action.payload
      case "reset":
        return []
      default:
        return state;
    }
  };
  const [players, setPlayers] = useReducer(playerReducer, []);

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
