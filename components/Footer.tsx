import { FC } from 'react'
import { Box, Text, Flex, Anchor, Button } from './primitives'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faDiscord, faTelegram, faTelegramPlane, faTwitter} from '@fortawesome/free-brands-svg-icons'
import {IconProp} from "@fortawesome/fontawesome-svg-core";

type SectionTitleProps = {
  title: string
}

const SectionTitle: FC<SectionTitleProps> = ({ title }) => (
  <Text style="subtitle1" css={{ color: '$gray12', mb: 8 }}>
    {title}
  </Text>
)

type SectionLinkProps = {
  name: string
  href: string
}

const SectionLink: FC<SectionLinkProps> = ({ name, href }) => (
  <Anchor
    target="_blank"
    rel="noopener noreferrer"
    href={href}
    weight="medium"
    css={{ fontSize: 14, mt: 16 }}
  >
    {name}
  </Anchor>
)

const resourcesSectionLinks = [
  {
    name: 'Medium',
    href: 'https://medium.com/@nftearth',
  },
  {
    name: 'Analytics',
    href: 'https://dune.com/nftearth/nftearth-analytics',
  },
  {
    name: 'Brand Assets',
    href: 'https://docs.nftearth.exchange/resources/brand-assets',
  },
]

const developerSectionLinks = [
  {
    name: 'Docs',
    href: 'https://docs.nftearth.exchange',
  },
  {
    name: 'GitHub',
    href: 'https://github.com/NFTEarth',
  },
  {
    name: 'CoinGecko',
    href: 'https://www.coingecko.com/en/coins/nftearth',
  },
  {
    name: 'CoinMarketCap',
    href: 'https://coinmarketcap.com/currencies/nftearth',
  },
  

]

const companySectionLinks = [
  {
    name: 'Governance',
    href: 'https://snapshot.org/#/nftearthl2.eth',
  },
  {
    name: 'Governance Discussion',
    href: 'https://discord.com/channels/1062256160264171520/1063532288866005043',
  },
  {
    name: 'Contact: team@nftearth.exchange',
    href: 'mailto:team@nftearth.exchange',
  },
  {
    name: 'Terms',
    href: '/terms',
  },
  {
    name: 'Privacy',
    href: '/privacy',
  },
]

export const Footer = () => {
  return (
    <Flex
      justify="between"
      css={{
        borderTop: '1px solid $gray7',
        borderStyle: 'solid',
        pt: '$5',
        flexDirection: 'column',
        alignItems: 'flex-start',
        gap: 36,
        '@bp600': {
          flexDirection: 'row',
          gap: 0,
        },
      }}
    >
      <Flex css={{ gap: 40, '@bp600': { gap: 136 }, flexWrap: 'wrap' }}>
        <Flex direction="column">
          <SectionTitle title="Developers" />
          {developerSectionLinks.map((props) => (
            <SectionLink key={props.name} {...props} />
          ))}
        </Flex>
        <Flex direction="column">
          <SectionTitle title="Protocol" />
          {companySectionLinks.map((props) => (
            <SectionLink key={props.name} {...props} />
          ))}
        </Flex>
        <Flex direction="column">
          <Flex direction="column">
            <SectionTitle title="Resources" />
            {resourcesSectionLinks.map((props) => (
              <SectionLink key={props.name} {...props} />
            ))}
          </Flex>
        </Flex>
      </Flex>
      <Flex
        direction="column"
        css={{ alignItems: 'flex-start', '@bp600': { alignItems: 'flex-end' } }}
      >
        <SectionTitle title="Community" />
        <Flex css={{ gap: '$4', mt: 16 }}>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://twitter.com/NFTEarth_L2"
            aria-label="Twitter"
          >
            <Button
              size="xs"
              color="gray3"
              css={{
                '&:hover': {
                  background: '$gray8',
                },
              }}
              aria-label="Twitter"
            >
              <FontAwesomeIcon icon={faTwitter} width={14} height={14} />
            </Button>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://discord.gg/56a7u3wDkX"
            aria-label="Discord"
          >
            <Button
              size="xs"
              color="gray3"
              css={{
                '&:hover': {
                  background: '$gray8',
                },
              }}
              aria-label="Discord"
            >
              <FontAwesomeIcon icon={faDiscord} width={14} height={14} />
            </Button>
          </a>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://t.me/nftearth_community"
            aria-label="Discord"
          >
            <Button
              size="xs"
              color="gray3"
              css={{
                '&:hover': {
                  background: '$gray8',
                },
              }}
              aria-label="Telegram"
            >
              <FontAwesomeIcon icon={faTelegramPlane} width={14} height={14} />
            </Button>
          </a>
        </Flex>
      </Flex>
    </Flex>
  )
}
