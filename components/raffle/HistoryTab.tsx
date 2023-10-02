import {FC} from "react";
import {useAccount, useNetwork} from "wagmi";
import { Flex,Text, TableCell, TableRow, HeaderRow} from "components/primitives";
import {useTheme} from "next-themes";
import {useMediaQuery} from "react-responsive";
import Link from "next/link";

import useRaffleHistory from "hooks/useRaffleHistory";
import {formatNumber} from "utils/numbers";

const desktopTemplateColumns = 'repeat(3, 1fr) .5fr'
const mobileTemplateColumns = 'repeat(2, 1fr) .5fr'

const HistoryTab = () => {
  const { address } = useAccount()
  const { data: logs, isValidating } = useRaffleHistory(process.env.ACTIVE_RAFFLE_ID as string, address) || {}

  return (
    <Flex direction="column" css={{ my: 20 }}>
      <Flex
        direction="column"
        css={{ width: '100%', maxHeight: 300, overflowY: 'auto', pb: '$2' }}
      >
        <TableHeading />
        {(logs || []).map((log: any, i: number) => {
          return (
            <LogTableRow
              key={`entry-${i}`}
              log={log}
            />
          )
        })}
      </Flex>
      {isValidating && (
        <Flex align="center" justify="center" css={{ py: '$5' }}>
          Loading...
        </Flex>
      )}
    </Flex>
  )
};

type LogTableRowProps = {
  log: any
}

const LogTableRow: FC<LogTableRowProps> = ({ log }) => {
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const { chain } = useNetwork()
  const { theme } = useTheme()

  return (
    <TableRow
      key={log.transactionHash}
      css={{
        gridTemplateColumns: isSmallDevice ? mobileTemplateColumns : desktopTemplateColumns,
        borderBottomColor: theme === 'light'
          ? '$primary11'
          : '$primary6',
        'div:first-child': {
          paddingLeft: '$2',
        },
        'div:last-child': {
          paddingRight: '$2',
        },
      }}
    >
      <TableCell css={{ pl: '$2', py: '$3' }}>
        <Flex align="center" justify="start">
          <Text style="subtitle2">{parseInt(log.raffleId.hex)}</Text>
        </Flex>
      </TableCell>
      <TableCell css={{ pl: '$2', py: '$3' }}>
        <Flex align="center" justify="center">
          <Text style="subtitle2">{formatNumber(log.entriesCount)}</Text>
        </Flex>
      </TableCell>
      {!isSmallDevice && (
        <TableCell css={{ pl: '$2', py: '$3' }}>
          <Flex align="center" justify="end">
            <Text style="subtitle2">{log.blockNumber}</Text>
          </Flex>
        </TableCell>
      )}
      <TableCell css={{ pl: '$2', py: '$3' }}>
        <Flex align="center" justify="end">
          <Link href={`${chain?.blockExplorers?.default.url}/tx/${log.transactionHash}`} target="_blank">
            <Text style="subtitle2" color="success">View</Text>
          </Link>
        </Flex>
      </TableCell>
    </TableRow>
  )
}


const TableHeading = () => {
  const { theme } = useTheme()
  const isSmallDevice = useMediaQuery({ maxWidth: 900 })
  const headings = isSmallDevice ? ['Raffle No.', 'Total Entries Bought', ''] : ['Raffle No.', 'Total Entries Bought', 'Block', '']
  return (
    <HeaderRow
      css={{
        display: 'grid',
        gridTemplateColumns: isSmallDevice ? mobileTemplateColumns : desktopTemplateColumns,
        position: 'sticky',
        top: 0,
        backgroundColor: theme === 'light'
          ? '$primary10'
          : '$primary5',
        'div:first-child': {
          paddingLeft: '$2',
        },
        'div:last-child': {
          paddingRight: '$2',
        },
      }}
    >
      {headings.map((heading) => (
        <TableCell
          key={heading}
          css={{ pl: '$2', py: '$1', border: '1px solid $primary2' }}
        >
          <Text as={'div'} style="subtitle3">
            {heading}
          </Text>
        </TableCell>
      ))}
    </HeaderRow>
  )
}


export default HistoryTab;