import Link from 'next/link'
import Image from "next/legacy/image"
import { Box, Button, Flex, Grid, Text } from './primitives'
import { FC } from 'react'

interface IProp {
  hideLink?: boolean
}

const HeroSection: FC<IProp> = ({ hideLink }) => {
  return (
    <Flex
      as="section"
      css={{
        position: 'relative',
        width: '100%',
        backgroundPosition: 'center center',
        backgroundImage: `url('/images/heroSectionBanner.png')`,
        backgroundSize: 'cover',
        '@xs': {
          gridTemplateColumns: 'unset',
          padding: '64px 24px',
        },
        '@lg': {
          gridTemplateColumns: 'repeat(2, 1fr)',
          padding: '100px 64px',
        },
      }}
    >
      <Box css={{
        opacity: 0.5,
        backgroundImage: 'linear-gradient(109.6deg, #000 11.2%, $primary9 91.1%)',
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        content: ' ',
      }}/>
      <Grid
        css={{
          gap: 32,
          '@xs': {
            flex: 1,
          },
          '@lg': {
            flex: 0.5,
          },
          zIndex: 1,
          position: 'relative'
        }}
      >
        <Flex align="center" css={{ gap: 20 }}>
          <Text
            style={{
              '@initial': 'h2',
              '@lg': 'h1'
            }}
            as="h1"
            css={{
              color: '$whiteA12', lineHeight: 1
            }}
          >
            NFTEarth
          </Text>
          <Image
            src="/nftearth-icon.svg"
            width={55}
            height={55}
            alt="NFTEarth Logo"
          />
        </Flex>

        <Text
          style="subtitle1"
          css={{
            lineHeight: 2,
            color: '$whiteA12',
            width: '100%',
            '@lg': { width: '50%' },
          }}
        >
          {`Omnichain NFT Marketplace`}
        </Text>
        {hideLink ?? (
          <Flex css={{ gap: 10 }}>
            <Link href="/portfolio" passHref legacyBehavior>
              <Button
                as="a"
                color="tertiary"
                size="large"
              >
                Trade NFTs Now
              </Button>
            </Link>
            
          </Flex>
        )}
      </Grid>
    </Flex>
  )
}

export default HeroSection
