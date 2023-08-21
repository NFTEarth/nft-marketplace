import {Flex, FormatCryptoCurrency, Text} from "../primitives";
import Highcharts from "highcharts";
import {Avatar} from "../primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import {useENSResolver} from "../../hooks";

export interface PlayerType extends Highcharts.PointOptionsObject {
  address: `0x${string}`,
  entry: bigint
}

const Player = ({ data } : { data: PlayerType }) => {
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
        backgroundColor: 'rgba(0,0,0, 0.1)',
        '&:hover': {
          backgroundColor: 'rgba(255,255,255, 0.1)'
        }
      }}
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