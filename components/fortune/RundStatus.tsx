import {Flex, FormatCryptoCurrency, FormatCurrency, Text} from "../primitives";
import {Avatar} from "../primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import {truncateAddress} from "../../utils/truncate";
import {FC} from "react";
import {PlayerType} from "./Player";
import {useFortune} from "../../hooks";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";

type RoundStatusProps = {
  totalPrize: bigint
  totalPrizeUsd: number
  loadingNewRound: boolean
  winner?: PlayerType
}

const FortuneRoundStatus: FC<RoundStatusProps> = (props) => {
  const { winner, totalPrize, totalPrizeUsd, loadingNewRound } = props;
  const { data: round } = useFortune<Round>(q => q.round)
  const { data: countdown } = useFortune<number>(q => q.countdown)
  
  return (
    <Flex
      direction="column"
      align="center"
      css={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)'
      }}
    >
      {(!winner && !!round?.roundId) && (
        <Text css={{ borderBottom: '1px solid #ddd'}}>{`Round ${round?.roundId || '-'}`}</Text>
      )}
      {([RoundStatus.Open, RoundStatus.Drawing, RoundStatus.Drawn].includes(round?.status) && !winner) && (
        <FormatCryptoCurrency textStyle="h3" logoHeight={35} amount={totalPrize} maximumFractionDigits={4} />
      )}
      {(!winner || countdown > 0) && (
        <FormatCurrency amount={totalPrizeUsd} />
      )}
      {(round?.status === RoundStatus.Open && countdown < 1) && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Validating round...</Text>
      )}
      {[RoundStatus.Drawing].includes(round?.status) && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Drawing Winner...</Text>
      )}
      {round?.status === RoundStatus.Cancelled && (
        <Text style="h5" css={{ color: '$primary10', mt: 20 }}>Round Cancelled</Text>
      )}
      {loadingNewRound && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Loading new round...</Text>
      )}
      {winner && (
        <Flex
          direction="column"
          align="center"
          css={{
            mt: -40
          }}
        >
          <Flex
            css={{
              backgroundImage: 'url(/images/winner-bg.png)',
              backgroundSize: 'contain',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              p: 40
            }}
          >
            {winner?.ensAvatar ? (
              <Avatar size="xl" src={winner?.ensAvatar} />
            ) : (
              <Jazzicon diameter={56} seed={jsNumberForAddress(winner?.address || '' as string)} />
            )}
          </Flex>
          <Text
            style="h4"
            css={{
              color: '$primary10',
              background: 'linear-gradient(rgb(21, 204, 50) 0%, rgb(21, 204, 50) 50%, rgb(21, 204, 50) 100%)',
              '-webkit-text-fill-color': 'transparent',
              '-webkit-background-clip': 'text'
            }}>
            {
              winner?.shortEnsName ||
              winner?.shortAddress ||
              truncateAddress(winner?.address || '')
            }
          </Text>
          <Flex css={{ gap: 20 }}>
            <FormatCryptoCurrency textStyle="subtitle1" logoHeight={15} amount={totalPrize} maximumFractionDigits={2} />
            <Text style="subtitle1">{`${((round?.numberOfEntries || 1) / (winner?.entry || 0)).toFixed(1)}x WIN`}</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default FortuneRoundStatus;