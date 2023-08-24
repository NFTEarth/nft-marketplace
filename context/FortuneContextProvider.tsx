import { useState, createContext, FC, useEffect } from 'react'
import {PlayerType} from "../components/fortune/Player";
import {PrizeType} from "../components/fortune/Prize";
import {parseEther} from "ethers/lib/utils";
import {AddressZero} from "@ethersproject/constants";

export const FortuneContext = createContext<{
  data: {
    status: number
    durationLeft: number
    players: PlayerType[]
    prizes: PrizeType[]
    enableAudio: boolean
    hoverPlayerIndex?: number
  }
  functions: {
    setStatus: ((status: number) => void) | null
    setDurationLeft: ((status: number) => void) | null
    setPlayers: ((players: PlayerType[]) => void) | null
    setPrizes: ((prizes: PrizeType[]) => void) | null
    setEnableAudio: ((enableAudio: boolean) => void) | null
    setHoverPlayerIndex: ((playerIndex?: number) => void) | null
  }
}>({
  data: {
    status: 0,
    durationLeft: 0,
    enableAudio: false,
    players: [],
    prizes: [],
  },
  functions: {
    setStatus: null,
    setEnableAudio: null,
    setDurationLeft: null,
    setPlayers: null,
    setPrizes: null,
    setHoverPlayerIndex: null
  }
})

const FortuneContextProvider: FC<any> = ({ children }) => {
  const [status, setStatus] = useState(0)
  const [enableAudio, setEnableAudio] = useState(false)
  const [players, setPlayers] = useState<PlayerType[]>([
    {
      y: 30,
      name: "Ryuzaki01",
      color: '#04cd58',
      address: '0x7D3E5dD617EAF4A3d42EA550C41097086605c4aF',
      entry: BigInt(parseEther('0.001').toString())
    },
    {
      y: 20,
      name: "Weston",
      color: '#2c51ff',
      address: '0xafd86179acd9a441801a5e582410e7e04e992d4a',
      entry: BigInt(parseEther('0.005').toString())
    }
  ])
  const [prizes, setPrizes] = useState<PrizeType[]>([
    {
      type: 'erc20',
      bidderName: 'ryuzaki01.eth',
      address: AddressZero,
      price: BigInt(parseEther('0.01').toString())
    },
    {
      type: 'erc721',
      bidderName: 'ryuzaki01.eth',
      address: '0x8778b7fd7e2480c6f9ad1075bd848b7ce1b9d90c',
      tokenId: BigInt(39),
      price: BigInt(parseEther('0.01').toString())
    }
  ])
  const [durationLeft, setDurationLeft] = useState(60 * 5)
  const [hoverPlayerIndex, setHoverPlayerIndex] = useState<number | undefined>(undefined)

  return (
    <FortuneContext.Provider
      value={{
        data: {
          status,
          players,
          prizes,
          enableAudio,
          durationLeft,
          hoverPlayerIndex,
        },
        functions: {
          setStatus,
          setPlayers,
          setPrizes,
          setEnableAudio,
          setDurationLeft,
          setHoverPlayerIndex
        }
      }}
    >
      {children}
    </FortuneContext.Provider>
  )
}

export default FortuneContextProvider
