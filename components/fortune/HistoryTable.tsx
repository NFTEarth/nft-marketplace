import {FC, useEffect, useMemo, useRef} from "react";
import {useIntersectionObserver} from "usehooks-ts";
import {Anchor, Box, Button, Flex, FormatCryptoCurrency, HeaderRow, TableCell, TableRow, Text} from "../primitives";
import LoadingSpinner from "../common/LoadingSpinner";
import {useMediaQuery} from "react-responsive";
import {useENSResolver, useMarketplaceChain, useMounted, useTimeSince} from "../../hooks";
import {NAVBAR_HEIGHT} from "../navbar";
import {Avatar} from "../primitives/Avatar";
import Jazzicon from "react-jazzicon/dist/Jazzicon";
import {jsNumberForAddress} from "react-jazzicon";
import {AddressZero} from "@ethersproject/constants";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";


type Props = {
  data: any
}

const HistoryTable : FC<Props> = ({ data }) => {
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})

  const rounds:any[] = data.data;

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
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
          <img src="/icons/fortune.png" width={40} height={40} />
          <Text>No History</Text>
        </Flex>
      ) : (
        <Flex direction="column" css={{ width: '100%', pb: '$2' }}>
          {rounds.map((round, i) => {
            if (!round) return null

            return (
              <RoundTableRow
                key={`${round?.txHash}-${i}`}
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

export type Round = {
  txHash: string
}

type RoundTableRowProps = {
  round: Round | any
}

const RoundTableRow: FC<RoundTableRowProps> = ({ round }) => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const marketplaceChain = useMarketplaceChain()
  const blockExplorerBaseUrl =
    marketplaceChain?.blockExplorers?.default?.url || 'https://etherscan.io'
  const finish = useTimeSince(round.drawTime || ((new Date).getTime() / 1000));

  if (!round) {
    return null
  }

  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(round?.winner)

  return (
    <Link href={`/fortune/${round.roundId}`} passHref legacyBehavior>
      <TableRow
        as="a"
        key={round.txHash}
        css={{
          px: '$2',
          gridTemplateColumns: '0.2fr 0.75fr repeat(3, 0.3fr)',
          '@lg': {
            gridTemplateColumns: '0.2fr 1fr repeat(5, 0.3fr) 0.75fr 0.2fr',
          },
        }}
      >
        <TableCell css={{ color: '$gray11' }}>
          <Flex justify="end">
            <Text>{round.roundId}</Text>
          </Flex>
        </TableCell>
        <TableCell css={{ color: '$gray11' }}>
          <Flex align="center" justify="start" css={{
            gap: 20,
          }}>
            <Flex css={{
              display: 'none',
              '@md': {
                display: 'flex'
              }
            }}>
              {ensAvatar ? (
                <Avatar size="medium" src={ensAvatar} />
              ) : (
                <Jazzicon diameter={44} seed={jsNumberForAddress(round.winner as string)} />
              )}
            </Flex>
            <Text>{shortEnsName ? shortEnsName : shortAddress}</Text>
          </Flex>
        </TableCell>
        <TableCell css={{ color: '$gray11' }}>
          <Flex justify="center">
            <FormatCryptoCurrency
              amount={round.prizePool}
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
            <FormatCryptoCurrency
              amount={round.winnerEntries}
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
            <Text>{`x${round.winnerROI || 1}`}</Text>
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
            <FormatCryptoCurrency
              amount={round.yourEntries}
              address={AddressZero}
              logoHeight={16}
              textStyle="subtitle1"
            />
          </Flex>
        </TableCell>
        <TableCell css={{ color: '$gray11' }}>
          <Flex justify="center">
            <Text>{round.players?.length || 0}</Text>
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
            <Text>{finish}</Text>
          </Flex>
        </TableCell>
        <TableCell>
          <Button
            as="a"
            size="xs"
            color="primary"
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            href={`${blockExplorerBaseUrl}/tx/${round.txHash}`}
          >
            <FontAwesomeIcon
              icon={faExternalLink}
              width={12}
              height={15}
            />
          </Button>
        </TableCell>
      </TableRow>
    </Link>
  )
}

const headings = ['Round', 'Winner', 'Prize Pool', 'Winner Entries', 'Win', 'Your Entries', 'Players', 'Finish', 'Verify']
const mobileHeadings = ['Round', 'Winner', 'Pool', 'Players', 'Verify']

const TableHeading = () => {
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted

  return  (
    <HeaderRow
      css={{
        display: 'grid',
        gridTemplateColumns: '0.2fr 0.75fr repeat(3, 0.3fr)',
        '@lg': {
          gridTemplateColumns: '0.2fr 1fr repeat(5, 0.3fr) 0.75fr 0.2fr',
        },
        position: 'sticky',
        top: NAVBAR_HEIGHT,
        backgroundColor: '$primary3',
        px: '$2',
        zIndex: 1,
      }}
    >
      {(isSmallDevice ? mobileHeadings : headings).map((heading) => (
        <TableCell key={heading}>
          <Text style="subtitle3" color="subtle">
            {heading}
          </Text>
        </TableCell>
      ))}
    </HeaderRow>
  )
}

export default HistoryTable