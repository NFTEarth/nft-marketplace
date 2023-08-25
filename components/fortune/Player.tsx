import {FC} from "react";
import Highcharts from "highcharts";
import {jsNumberForAddress} from "react-jazzicon";
import Jazzicon from "react-jazzicon/dist/Jazzicon";

import {Flex, FormatCryptoCurrency, Text} from "../primitives";
import {Avatar} from "../primitives/Avatar";
import {useENSResolver, useFortune} from "../../hooks";

export interface PlayerType extends Highcharts.PointOptionsObject {
  address: `0x${string}`,
  entry: number
}

type PlayerProps = {
  index: number,
  data: PlayerType
}

const Player: FC<PlayerProps> = ({ index, data, ...restProps }) => {
  const { data: hoverPlayerIndex, setHoverPlayerIndex } = useFortune<number>(d => d.hoverPlayerIndex)
  const { data: status } = useFortune<number>(d => d.status)

  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(data.address)

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
        transition: 'background, filter .5s',
        ...((status !== 0 && hoverPlayerIndex !== index) ? {
          filter: 'opacity(0.4)'
        } : {}),
        '&:hover': {
          backgroundColor: 'rgba(255,255,255, 0.1)'
        }
      }}
      onMouseOver={() => {
        setHoverPlayerIndex?.(index)
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
        <FormatCryptoCurrency amount={data.entry} />
      </Flex>
      <Flex align="center">
        <Text>{`${data.y}%`}</Text>
      </Flex>
    </Flex>
  )
}

export default Player;