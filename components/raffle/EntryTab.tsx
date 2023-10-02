import {Flex, Grid, Text} from "components/primitives";
import ProgressBar from "../common/ProgressBar";
import EntryBox from "./EntryBox";

const EntryTab = (props: any) => {
  const {
    entryRef,
    maximumEntriesPerParticipant,
    entriesCount,
    pricing,
    handleEntry
  } = props;

  return (
    <>
      <Flex align="center" css={{
        flex: 1,
        gap: 20,
        '@bp800': {
          px: 40
        }
      }} direction="column">
        <Flex
          direction="row"
          align="center"
          justify="center"
          css={{
            mt: '$6',
            gap: '0.5rem',
            flexWrap: 'wrap',
            textAlign: 'center'
          }}>
          <Text style="h5">{`You can buy up to `}</Text>
          <Text style="h5" css={{ color: '$primary9' }}>{maximumEntriesPerParticipant - entriesCount}</Text>
          <Text style="h5">{` entries until the raffle starts`}</Text>
        </Flex>
        <Flex direction="column" css={{
          width: '100%'
        }}>
          <Flex justify="end">
            <Text style="body2">{`${entriesCount}/${maximumEntriesPerParticipant}`}</Text>
          </Flex>
          <ProgressBar percentage={(entriesCount / maximumEntriesPerParticipant) * 100} />
        </Flex>
      </Flex>
      <Flex ref={r => entryRef.current = r} align="center" justify="center" css={{ flex: 1 }}>
        <Grid
          css={{
            flex: 1,
            mt: 50,
            gap: 10,
            gridTemplateColumns: 'repeat(1, 1fr)',
            '@bp800': {
              gridTemplateColumns: 'repeat(2, 1fr)'
            }
          }}
        >
          {pricing.map((price: any, i: number) => i == 0 ? null : (
            <EntryBox
              key={`raffle-entry-${i}`}
              index={i}
              handleEntry={handleEntry}
              maxPerWallet={maximumEntriesPerParticipant - entriesCount}
              pricing={price}
            />
          ))}
        </Grid>
      </Flex>
    </>
  )
};

export default EntryTab;