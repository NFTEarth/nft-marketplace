import {FC, useEffect, useRef} from "react";
import {useIntersectionObserver} from "usehooks-ts";
import {Box, Button, Flex, FormatCryptoCurrency, HeaderRow, TableCell, TableRow, Text} from "../primitives";
import LoadingSpinner from "../common/LoadingSpinner";
import {useMediaQuery} from "react-responsive";
import {useENSResolver, useMarketplaceChain, useMounted} from "../../hooks";
import {NAVBAR_HEIGHT} from "../navbar";
import {AddressZero} from "@ethersproject/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faClockFour, faExternalLink, faTimesCircle} from "@fortawesome/free-solid-svg-icons";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";
import {useAccount} from "wagmi";
import {Avatar} from "../primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import dayjs from "dayjs";

type Props = {
  data: any
}

const HistoryTable : FC<Props> = ({ data }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const rounds: Round[] = data?.data || [];

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible && !data.isFetchingPage) {
      data.fetchNextPage?.()
    }
  }, [loadMoreObserver?.isIntersecting])

  return (
    <Flex direction="column">
      <TableHeading />
      {!data.isValidating &&
      !data.isFetchingPage &&
      rounds &&
      rounds.length === 0 ? (
        <Flex direction="column" align="center" css={{ py: '$6', gap: '$4' }}>
          <img src="/images/fortune.png" width={40} height={40} />
          <Text>No History</Text>
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          {rounds.map((round, i) => {
            if (!round) return null

            return (
              <RoundTableRow
                key={`${round?.roundId}-${i}`}
                round={round}
              />
            )
          })}
          <Box ref={loadMoreRef} css={{ height: 20 }}/>
        </Flex>
      )}
      {data.isValidating && (
        <Flex align="center" justify="center" css={{ py: '$5' }}>
          <LoadingSpinner />
        </Flex>
      )}
    </Flex>
  )
}

type RoundTableRowProps = {
  round: Round
}

const mobileTemplateColumn = '1fr'
const desktopTemplateColumn = '0.2fr 0.7fr repeat(5, 0.4fr) 0.75fr 0.2fr'

const RoundTableRow: FC<RoundTableRowProps> = ({ round }) => {
  const { address } = useAccount();
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const marketplaceChain = useMarketplaceChain()
  const blockExplorerBaseUrl =
    marketplaceChain?.blockExplorers?.default?.url || 'https://etherscan.io'

  if (!round) {
    return null
  }

  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(round?.winner)

  const winnerEntry: bigint = round.deposits
    .filter(d => new RegExp(round.winner as string, 'i').test(d.depositor))
    .reduce((a, b) => a + BigInt(b.entriesCount), BigInt(0));
  const winnerEntryValue = BigInt(winnerEntry) * BigInt(round.valuePerEntry)
  const yourEntry = BigInt(round.valuePerEntry) * round.deposits
    .filter(d => new RegExp(address as string, 'i').test(d.depositor))
    .reduce((a, b) => a + BigInt(b.entriesCount), BigInt(0))
  const prizePool = BigInt(BigInt(round.numberOfEntries) * BigInt(round.valuePerEntry))
  const ROI = (+`${(BigInt(round.numberOfEntries || 1) / BigInt(winnerEntry || 1))}`).toFixed(2);

  return (
    <TableRow
      as="a"
      href={`/fortune/${round.roundId}`}
      key={round.roundId}
      css={{
        px: '$3',
        gridTemplateColumns: mobileTemplateColumn,
        '@lg': {
          gridTemplateColumns: desktopTemplateColumn,
        },
      }}
    >
      {isSmallDevice ? (
        <>
          <TableCell css={{ color: '$gray11' }}>
            <Flex
              justify="between"
              css={{
                flex: 1,
                flexDirection: 'column',
                gap: 20,
              }}>
              <Flex align="center" justify="between" css={{ gap: 20, backgroundColor: '$gray3', p: '$3' }}>
                <Text>{round.roundId}</Text>
                <Flex align="center" css={{ gap: 10, flex: 1 }}>
                  {round.status === RoundStatus.Drawn && (
                    ensAvatar ? (
                      <Avatar size="medium" src={ensAvatar} />
                    ) : (
                      <Jazzicon diameter={36} seed={jsNumberForAddress(round.winner as string)} />
                    )
                  )}
                  {[RoundStatus.Open, RoundStatus.Drawing].includes(round.status) && (
                    <FontAwesomeIcon icon={faClockFour} width={16} height={16} color={round.status === RoundStatus.Drawing ? 'green' : '#ddd'} />
                  )}
                  {round.status === RoundStatus.Cancelled && (
                    <FontAwesomeIcon icon={faTimesCircle} width={16} height={16} color="red" />
                  )}
                  {round.status === RoundStatus.Drawn && (
                    <Text>{shortEnsName ? shortEnsName : shortAddress}</Text>
                  )}
                  {round.status === RoundStatus.Open && (
                    <Text>Current Round</Text>
                  )}
                  {round.status === RoundStatus.Cancelled && (
                    <Text>Round Cancelled</Text>
                  )}
                  {round.status === RoundStatus.Drawing && (
                    <Text>Round Cancelled</Text>
                  )}
                </Flex>
                <Text style="body4">
                  {`${round.numberOfParticipants || 0} Player`}
                </Text>
              </Flex>
              <Flex
                align="center"
                justify="around"
                css={{
                  gap: 20,
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr'
                }}>
                <Flex direction="column" align="center" justify="between">
                  <Text>
                    Prize Pool
                  </Text>
                  <FormatCryptoCurrency
                    amount={prizePool}
                    address={AddressZero}
                    logoHeight={16}
                    textStyle="subtitle1"
                  />
                </Flex>
                <Flex direction="column" align="center" justify="between">
                  <Text>
                    WIN
                  </Text>
                  {round.status === RoundStatus.Drawn ? (
                    <Text>{`x${ROI || 0}`}</Text>
                  ) : '-'}
                </Flex>
                <Flex direction="column" align="center" justify="between">
                  <Text>
                    Winner Entry
                  </Text>
                  {round.status === RoundStatus.Drawn ? (
                    <FormatCryptoCurrency
                      amount={winnerEntryValue}
                      address={AddressZero}
                      logoHeight={16}
                      textStyle="subtitle1"
                    />
                  ) : '-'}
                </Flex>
                <Flex direction="column" align="center" justify="between">
                  <Text>
                    Your Entry
                  </Text>
                  {yourEntry > 0 ? (
                    <FormatCryptoCurrency
                      amount={yourEntry}
                      address={AddressZero}
                      logoHeight={16}
                      textStyle="subtitle1"
                    />
                  ) : '-' }
                </Flex>
              </Flex>
              <Flex align="center" justify="between" css={{ backgroundColor: '$gray3', p: '$3'}}>
                <Text>{dayjs(round.cutoffTime * 1000).format('HH:mm, MMM, D, YYYY')}</Text>
                {round.status === RoundStatus.Drawn && (
                  <Button
                    size="xs"
                    color="primary"
                    onClick={e => {
                      e.stopPropagation()
                      window.open(`${blockExplorerBaseUrl}/tx/${round.drawnHash}`, '_blank','noopener')
                    }}
                    css={{
                      cursor: 'pointer'
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faExternalLink}
                      width={15}
                      height={15}
                    />
                  </Button>
                )}
              </Flex>
            </Flex>
          </TableCell>
        </>
      ) : (
        <>
          <TableCell css={{ color: '$gray11' }}>
            <Flex justify="end">
              <Text>{round.roundId}</Text>
            </Flex>
          </TableCell>
          <TableCell css={{ color: '$gray11' }}>
            <Flex
              align="center"
              justify="start"
              css={{
                gap: 20,
              }}>
              <Flex>
                {round.status === RoundStatus.Drawn && (
                  ensAvatar ? (
                    <Avatar size="medium" src={ensAvatar} />
                  ) : (
                    <Jazzicon diameter={36} seed={jsNumberForAddress(round.winner as string)} />
                  )
                )}
                {[RoundStatus.Open, RoundStatus.Drawing].includes(round.status) && (
                  <FontAwesomeIcon icon={faClockFour} width={36} height={36} color={round.status === RoundStatus.Drawing ? 'green' : '#ddd'} />
                )}
                {round.status === RoundStatus.Cancelled && (
                  <FontAwesomeIcon icon={faTimesCircle} width={36} height={36} color="red" />
                )}
              </Flex>
              {round.status === RoundStatus.Drawn && (
                <Text>{shortEnsName ? shortEnsName : shortAddress}</Text>
              )}
              {round.status === RoundStatus.Open && (
                <Text>Current Round</Text>
              )}
              {round.status === RoundStatus.Cancelled && (
                <Text>Round Cancelled</Text>
              )}
              {round.status === RoundStatus.Drawing && (
                <Text>Round Cancelled</Text>
              )}
            </Flex>
          </TableCell>
          <TableCell css={{ color: '$gray11' }}>
            <Flex justify="center">
              <FormatCryptoCurrency
                amount={prizePool}
                address={AddressZero}
                logoHeight={16}
                textStyle="subtitle1"
              />
            </Flex>
          </TableCell>
          <TableCell
            css={{
              color: '$gray11',
              display: 'none',
              '@md': {
                display: 'block'
              }
            }}>
            <Flex justify="center">
              {round.status === RoundStatus.Drawn ? (
                <FormatCryptoCurrency
                  amount={winnerEntryValue}
                  address={AddressZero}
                  logoHeight={16}
                  textStyle="subtitle1"
                />
              ) : '-'}
            </Flex>
          </TableCell>
          <TableCell
            css={{
              color: '$gray11',
              display: 'none',
              '@md': {
                display: 'block'
              }
            }}>
            <Flex justify="center">
              {round.status === RoundStatus.Drawn ? (
                <Text>{`x${ROI || 0}`}</Text>
              ) : '-'}
            </Flex>
          </TableCell>
          <TableCell
            css={{
              color: '$gray11',
              display: 'none',
              '@md': {
                display: 'block'
              }
            }}>
            <Flex justify="center">
              {yourEntry > 0 ? (
                <FormatCryptoCurrency
                  amount={yourEntry}
                  address={AddressZero}
                  logoHeight={16}
                  textStyle="subtitle1"
                />
              ) : '-' }
            </Flex>
          </TableCell>
          <TableCell css={{ color: '$gray11' }}>
            <Flex justify="center">
              <Text>{round.numberOfParticipants || 0}</Text>
            </Flex>
          </TableCell>
          <TableCell
            css={{
              color: '$gray11',
              display: 'none',
              '@md': {
                display: 'block'
              }
            }}>
            <Flex justify="center">
              <Text>{dayjs(round.cutoffTime * 1000).format('HH:mm, MMM, D, YYYY')}</Text>
            </Flex>
          </TableCell>
          <TableCell>
            {round.status === RoundStatus.Drawn && (
              <Button
                size="xs"
                color="primary"
                onClick={e => {
                  e.stopPropagation()
                  window.open(`${blockExplorerBaseUrl}/tx/${round.drawnHash}`, '_blank','noopener')
                }}
                css={{
                  cursor: 'pointer'
                }}
              >
                <FontAwesomeIcon
                  icon={faExternalLink}
                  width={12}
                  height={15}
                />
              </Button>
            )}
          </TableCell>
        </>
      )}
    </TableRow>
  )
}

const headings = ['Round', 'Winner', 'Prize Pool', 'Winner Entries', 'Win', 'Your Entries', 'Players', 'Finish', 'Verify']

const TableHeading = () => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted

  if (isSmallDevice) {
    return null;
  }

  return  (
    <HeaderRow
      css={{
        display: 'grid',
        gridTemplateColumns: mobileTemplateColumn,
        '@lg': {
          gridTemplateColumns: desktopTemplateColumn,
        },
        position: 'sticky',
        top: NAVBAR_HEIGHT,
        backgroundColor: '$secondary8',
        px: '$3',
        zIndex: 1,
      }}
    >
      {headings.map((heading) => (
        <TableCell key={heading}>
          <Text style="subtitle2" color="dark">
            {heading}
          </Text>
        </TableCell>
      ))}
    </HeaderRow>
  )
}

export default HistoryTable