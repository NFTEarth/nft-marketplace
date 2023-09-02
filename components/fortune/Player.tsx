import {FC, useEffect} from "react";
import Highcharts from "highcharts";
import {jsNumberForAddress} from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";

import {Flex, FormatCryptoCurrency, Text} from "../primitives";
import {Avatar} from "../primitives/Avatar";
import {useENSResolver, useFortune} from "../../hooks";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";

export interface PlayerType extends Highcharts.PointOptionsObject {
  index: number
  address: `0x${string}`
  entry: bigint
  y: number
  color: string
  shortAddress?: string
  shortEnsName?: string
  ensAvatar?: string
  angle?: number
}

type PlayerProps = {
  data: PlayerType,
  valuePerEntry: bigint
}

const Player: FC<PlayerProps> = ({ data, valuePerEntry, ...restProps }) => {
  const { data: hoverPlayerIndex, setHoverPlayerIndex, setPlayers } = useFortune<number>(d => d.hoverPlayerIndex)
  const { data: round } = useFortune<Round>(d => d.round)

  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(data.address)

  useEffect(() => {
    setPlayers?.({
      type: 'update',
      index: data.index,
      payload: {
        ensAvatar,
        shortAddress,
        shortEnsName: shortEnsName || undefined
      }
    })
  }, [ensAvatar, shortEnsName])

  const isHovered = (hoverPlayerIndex > -1 && hoverPlayerIndex === data.index)

  return (
    <Flex
      justify="between"
      css={{
        p: '$2',
        borderRadius: 6,
        borderRightColor: data.color as string,
        borderRightWidth: 5,
        gap: 10,
        cursor: 'pointer',
        userSelect: 'none',
        backgroundColor: 'rgba(0,0,0, 0.1)',
        transition: 'background-color, filter .5s',
        ...((!isHovered &&
            [RoundStatus.Drawn, RoundStatus.Drawing].includes(round?.status)) ? {
          filter: 'opacity(0.4)'
        } : {}),
        '&:hover': {
          backgroundColor: 'rgba(255,255,255, 0.1)'
        }
      }}
      onMouseOver={() => {
        setHoverPlayerIndex?.(data.index)
      }}
      onMouseLeave={() => {
        setHoverPlayerIndex?.(undefined)
      }}
      {...restProps}
    >
      {ensAvatar ? (
        <Avatar size="medium" src={ensAvatar} />
      ) : (
        <Jazzicon diameter={44} seed={jsNumberForAddress(data.address as string)} />
      )}
      <Flex align="start" direction="column" css={{ flex: 1 }}>
        <Text>{shortEnsName || data.name || shortAddress}</Text>
        <FormatCryptoCurrency amount={BigInt(data.entry || 0) * BigInt(valuePerEntry || 0)} />
      </Flex>
      <Flex align="center">
        <Text>{`${data.y}%`}</Text>
      </Flex>
    </Flex>
  )
}

export default Player;