import {Anchor, Flex, Text} from "../primitives";

const fortuneSection = [
  {
    name: 'Getting Started',
    href: 'https://docs.nftearth.exchange/getting-started/nftearth-fortune',
  },
  {
    name: 'Subgraph',
    href: 'https://api.thegraph.com/subgraphs/name/ryuzaki01/fortune',
  },
]

const contractsSection = [
  {
    name: 'Fortune',
    href: 'https://arbiscan.io/address/0xb11ed4d3b3d8ace516ceae0a8d4764bbf2b08c50',
  },
  {
    name: 'Transfer Manager',
    href: 'https://arbiscan.io/address/0xf502c99ebdffd2f5fb92c162ea12d741b98402c2',
  },
  {
    name: 'Price Oracle',
    href: 'https://arbiscan.io/address/0x896397f72bd5c207cab95740d48ca76acf960b16',
  },
]

const FortuneFooter = () => {
  return (
    <Flex
      justify="between"
      css={{
        p: 40,
        borderTop: '1px solid $gray7',
        borderStyle: 'solid',
        pt: '$5',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 36,
        pb: 170,
        '@bp600': {
          flexDirection: 'row',
          gap: 0,
          pb: 40
        },
      }}
    >
      <Flex css={{ gap: 40, '@bp600': { gap: 136 }, flexWrap: 'wrap' }}>
        <Flex direction="column">
          <Text style="subtitle1" css={{ color: '$gray12', mb: 8 }}>
            Fortune
          </Text>
          {fortuneSection.map((props) => (
            <Anchor
              key={props.name}
              target="_blank"
              rel="noopener noreferrer"
              href={props.href}
              weight="medium"
              css={{ fontSize: 14, mt: 16 }}
            >
              {props.name}
            </Anchor>
          ))}
        </Flex>
        <Flex direction="column">
          <Text style="subtitle1" css={{ color: '$gray12', mb: 8 }}>
            Contracts
          </Text>
          {contractsSection.map((props) => (
            <Anchor
              key={props.name}
              target="_blank"
              rel="noopener noreferrer"
              href={props.href}
              weight="medium"
              css={{ fontSize: 14, mt: 16 }}
            >
              {props.name}
            </Anchor>
          ))}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        css={{ alignItems: 'flex-start', '@bp600': { alignItems: 'flex-end' } }}
      >
        <Flex direction="row" css={{ my: 10, gap: 20 }}>
          <a
            href="https://docs.chain.link/vrf/v2/introduction"
            target="_blank"
            rel="noreferrer noopener"
          >
            <img
              id="badge-button"
              style={{ height: 80 }}
              src={'/images/secured_chainlink_badge.png'}
              alt="Secured by Chainlink"
            />
          </a>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default FortuneFooter;