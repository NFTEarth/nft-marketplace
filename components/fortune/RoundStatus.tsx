import {Flex, FormatCryptoCurrency, FormatCurrency, Text} from "../primitives";
import {Avatar} from "../primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import {truncateAddress} from "../../utils/truncate";
import {FC, useMemo, useRef} from "react";
import {PlayerType} from "./Player";
import {useFortune, useMounted} from "../../hooks";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";
import useCountdown from "../../hooks/useCountdown";

type RoundStatusProps = {
  totalPrize: bigint
  totalPrizeUsd: number
  loadingNewRound: boolean
  winner?: PlayerType
}

const FortuneRoundStatus: FC<RoundStatusProps> = (props) => {
  const { winner, totalPrize, totalPrizeUsd, loadingNewRound } = props;
  const progressIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const { data: round } = useFortune<Round>(q => q.round)
  const cutOffTime = useMemo(() => round?.cutoffTime || 0, [round])
  const [_hours, minutes, seconds] = useCountdown(cutOffTime * 1000)
  const isEnded = minutes === 0 && seconds === 0

  const isMounted = useMounted()

  if (!isMounted) {
    return null
  }
  
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
      {(!winner || !isEnded) && (
        <FormatCurrency amount={totalPrizeUsd} />
      )}
      {(round?.status === RoundStatus.Open && isEnded && !loadingNewRound) && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Validating Round...</Text>
      )}
      {[RoundStatus.Drawing].includes(round?.status) && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Drawing Winner!</Text>
      )}
      {round?.status === RoundStatus.Cancelled && (
        <Text style="h5" css={{ color: '$primary10', mt: 20, textAlign: 'center' }}>Round Cancelled...</Text>
      )}
      {loadingNewRound && (
        <Text style="subtitle1" css={{ color: '$primary10', textAlign: 'center' }}>Loading A New Round...</Text>
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
              background: 'linear-gradient(120deg, rgb(21, 204, 50) 0%, $primary9 80%, $primary9 100%)',
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
            <Text style="subtitle1">{`${(+`${BigInt(round?.numberOfEntries || 1) / BigInt(winner?.entry || 0)}`).toFixed(1)}x WIN`}</Text>
          </Flex>
        </Flex>
      )}
    </Flex>
  )
}

export default FortuneRoundStatus;
