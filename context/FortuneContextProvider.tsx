import {useState, createContext, FC, useReducer, Dispatch} from 'react'
import {PlayerType} from "../components/fortune/Player";
import {PrizeType} from "../components/fortune/Prize";
import {SelectionData} from "../components/fortune/NFTEntry";
import {Round} from "../hooks/useFortuneRound";

export const FortuneContext = createContext<{
  data: {
    round: Round | null
    countdown: number
    valueEth: string
    winner: `0x${string}` | null
    players: PlayerType[]
    prizes: PrizeType[]
    selections: Record<string, SelectionData>
    enableAudio: boolean
    hoverPlayerIndex?: number
  }
  functions: {
    setRound: ((round: Round | null) => void) | null
    setWinner: ((winner: `0x${string}`) => void) | null
    setValueEth: ((valueEth: string) => void) | null
    setCountdown: ((countdown: number) => void) | null
    setSelections: ((status: Record<string, SelectionData>) => void) | null
    setPlayers: Dispatch<PlayerAction> | null
    setPrizes: ((prizes: PrizeType[]) => void) | null
    setEnableAudio: ((enableAudio: boolean) => void) | null
    setHoverPlayerIndex: ((playerIndex?: number) => void) | null
  }
}>({
  data: {
    round: null,
    winner: null,
    valueEth: '',
    countdown: 0,
    enableAudio: false,
    selections: {},
    players: [],
    prizes: [],
  },
  functions: {
    setRound: null,
    setWinner: null,
    setValueEth: null,
    setSelections: null,
    setEnableAudio: null,
    setCountdown: null,
    setPlayers: null,
    setPrizes: null,
    setHoverPlayerIndex: null,
  }
})

type PlayerResetAction = {
  type: 'reset'
}

type PlayerUpdateAction = {
  type: 'update'
  index: number
  payload: Partial<PlayerType>
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
  const [round, setRound] = useState<Round | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [valueEth, setValueEth] = useState('')
  const [winner, setWinner] = useState<`0x${string}` | null>(null)
  const [enableAudio, setEnableAudio] = useState(false)
  const [prizes, setPrizes] = useState<PrizeType[]>([])
  const [selections, setSelections] = useState<Record<string, SelectionData>>({})
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
          round,
          players,
          prizes,
          winner,
          valueEth,
          selections,
          enableAudio,
          countdown,
          hoverPlayerIndex,
        },
        functions: {
          setRound,
          setPlayers,
          setWinner,
          setPrizes,
          setValueEth,
          setSelections,
          setEnableAudio,
          setCountdown,
          setHoverPlayerIndex,
        }
      }}
    >
      {children}
    </FortuneContext.Provider>
  )
}

export default FortuneContextProvider
