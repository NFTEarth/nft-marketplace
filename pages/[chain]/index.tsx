import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from 'next'
import Image from 'next/image'
import { Text, Flex, Box } from 'components/primitives'
import Layout from 'components/Layout'
import { paths } from '@reservoir0x/reservoir-sdk'
import { useContext, useEffect, useMemo, useState } from 'react'
import { Footer } from 'components/Footer'
import { useMediaQuery } from 'react-responsive'
import { useMarketplaceChain, useMounted } from 'hooks'
import supportedChains, {DefaultChain} from 'utils/chains'
import { Head } from 'components/Head'
import { ChainContext } from 'context/ChainContextProvider'
import { Dropdown, DropdownMenuItem } from 'components/primitives/Dropdown'
import { faChevronDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useRouter } from 'next/router'
import { ChainStats } from 'components/home/ChainStats'
import useTopSellingCollections from 'hooks/useTopSellingCollections'
import { CollectionTopSellingTable } from 'components/home/CollectionTopSellingTable'
import { FillTypeToggle } from 'components/home/FillTypeToggle'
import { TimeFilterToggle } from 'components/home/TimeFilterToggle'
import HeroSection from "components/HeroSection";
import fetcher from 'utils/fetcher'
import Link from 'next/link'
import {faDiscord, faGithub, faLinkedin, faTwitter} from "@fortawesome/free-brands-svg-icons";

type Props = InferGetStaticPropsType<typeof getStaticProps>

const IndexPage: NextPage<Props> = ({ ssr }) => {
  const isSSR = typeof window === 'undefined'
  const isMounted = useMounted()
  const isSmallDevice = useMediaQuery({ maxWidth: 905 }) && isMounted
  const marketplaceChain = useMarketplaceChain()
  const router = useRouter()
  const [fillType, setFillType] = useState<'mint' | 'sale' | 'any'>('sale')
  const [minutesFilter, setMinutesFilter] = useState<number>(1440)

  const { chain, switchCurrentChain } = useContext(ChainContext)

  const startTime = useMemo(() => {
    const now = new Date()
    const timestamp = Math.floor(now.getTime() / 1000)
    return timestamp - minutesFilter * 60
  }, [minutesFilter])

  const {
    data: topSellingCollectionsData,
    collections: collectionsData,
    isFetchingInitialData,
    isValidating,
  } = useTopSellingCollections(
    {
      startTime,
      fillType,
      limit: 10,
      includeRecentSales: true,
    },
    {
      revalidateOnMount: true,
      refreshInterval: 300000,
      loadingTimeout: 30 * 1000,
      fallbackData: [
        ssr.topSellingCollections[marketplaceChain.id].collections,
      ],
    },
    chain?.id
  )

  const [topSellingCollections, setTopSellingCollections] = useState<
    ReturnType<typeof useTopSellingCollections>['data']
  >(ssr.topSellingCollections[marketplaceChain.id])
  const [collections, setCollections] =
    useState<ReturnType<typeof useTopSellingCollections>['collections']>(
      collectionsData
    )

  useEffect(() => {
    if (!isValidating) {
      setTopSellingCollections(topSellingCollectionsData)
      setCollections(collectionsData)
    }
  }, [isValidating])

  return (
    <Layout>
      <Head />
      <HeroSection />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex
          direction="column"
          css={{
            mx: 'auto',
            maxWidth: 728,
            pt: '$5',
            textAlign: 'center',
            alignItems: 'flex-start',
            '@bp600': { alignItems: 'center' },
          }}
        >
          <Flex
            css={{
              mb: '$4',
              gap: '$3',
              flexDirection: 'column',
              alignItems: 'flex-start',
              maxWidth: '100%',
              '@bp600': {
                flexDirection: 'row',
                alignItems: 'center',
              },
            }}
          >
            <Text style={{
              '@initial': 'h4',
              '@md': 'h3'
            }} css={{ flexShrink: 0 }}>
              Explore NFTs
            </Text>{' '}
            <Flex css={{ gap: '$3', maxWidth: '100%' }}>
              <Text style={{
                '@initial': 'h4',
                '@md': 'h3'
              }} color="subtle">
                on
              </Text>
              <Dropdown
                contentProps={{
                  sideOffset: 8,
                  asChild: true,
                  style: {
                    margin: 0,
                  },
                }}
                trigger={
                  <Flex
                    css={{
                      gap: '$3',
                      alignItems: 'center',
                      cursor: 'pointer',
                      minWidth: 0,
                    }}
                  >
                    <img
                      src={`/home/logos/${marketplaceChain.routePrefix}-logo.png`}
                      alt={`${marketplaceChain.name} Logo`}
                      style={{ width: 40, height: 40 }}
                    />
                    <Text  style={{
                      '@initial': 'h4',
                      '@md': 'h3'
                    }} ellipsify>
                      {' ' + marketplaceChain.name}
                    </Text>
                    <Box
                      css={{
                        color: '$gray10',
                        transition: 'transform',
                        '[data-state=open] &': { transform: 'rotate(180deg)' },
                      }}
                    >
                      <FontAwesomeIcon icon={faChevronDown} width={16} />
                    </Box>
                  </Flex>
                }
              >
                <Flex direction="column" css={{ minWidth: 150 }}>
                  {supportedChains.map(({ name, id, routePrefix }) => (
                    <DropdownMenuItem
                      css={{
                        textAlign: 'left',
                        py: '$2',
                      }}
                      key={id}
                      onClick={() => {
                        switchCurrentChain(id)

                        router.replace(routePrefix, undefined, {
                          scroll: false,
                          shallow: true,
                        })
                      }}
                    >
                      <Text
                        style="h6"
                        color={
                          id === marketplaceChain.id ? undefined : 'subtle'
                        }
                        css={{ cursor: 'pointer' }}
                      >
                        {name}
                      </Text>
                    </DropdownMenuItem>
                  ))}
                </Flex>
              </Dropdown>
            </Flex>
          </Flex>
          <Text
            style="body1"
            color="subtle"
            css={{ mb: 48, textAlign: 'left' }}
          >
            Omnichain NFT Hub | Powered by NFTEarth
          </Text>
        </Flex>
        {!isSmallDevice ? <ChainStats /> : null}
        <Flex
          css={{ mb: '$6', '@sm': { my: '$6' }, gap: 32 }}
          direction="column"
        >
          <Flex
            justify="between"
            align="center"
            css={{
              gap: '$2',
            }}
          >
            <FillTypeToggle fillType={fillType} setFillType={setFillType} />
            <TimeFilterToggle
              minutesFilter={minutesFilter}
              setMinutesFilter={setMinutesFilter}
            />
          </Flex>
          {(isSSR || !isMounted || isFetchingInitialData) ? null : (
            <CollectionTopSellingTable
              key={`${chain.routePrefix}-top-collection`}
              topSellingCollections={topSellingCollections?.collections}
              collections={collections}
              loading={isValidating}
              fillType={fillType}
            />
          )}
        </Flex>
        <Flex
          direction="column"
          align="center"
          justify="center"
          css={{
            maxWidth: 1400,
            px: 40,
            py: 100,
            gap: 100
          }}
        >
          <Text
            style="h4"
            css={{
              textAlign: 'center'
            }}
          >
            {`Who we are :`}
          </Text>
          <Flex css={{
            gap: 40,
            display: 'grid',
            gridTemplateColumns: '1fr',
            '@lg' : {
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
            }
          }}>
            <Flex
              direction="column"
              align="center"
            >
              <Image
                src="/images/profile/weston.jpeg"
                width={80}
                height={80}
                style={{
                  borderRadius: '60%',
                  overflow: 'hidden'
                }}
                alt="Weston"
              />
              <Text style="h4" color="primary">Weston Nelson</Text>
              <Text>aka WΞston</Text>
              <Text style="h5">Project Lead</Text>
              <Flex
                css={{
                  gap: 10
                }}
              >
                <Link href="https://github.com/westonnelson" target="_blank">
                  <FontAwesomeIcon icon={faGithub} size="lg" color="#fff" />
                </Link>
                <Link href="https://x.com/westonnelson/" target="_blank">
                  <FontAwesomeIcon icon={faTwitter} size="lg" color="#fff" />
                </Link>
                <Link href="https://discordapp.com/users/456602347209228288" target="_blank">
                  <FontAwesomeIcon icon={faDiscord} size="lg" color="#fff" />
                </Link>
              </Flex>
            </Flex>
            <Flex
              direction="column"
              align="center"
            >
              <Image
                src="/images/profile/ryuzaki.jpeg"
                width={80}
                height={80}
                style={{
                  borderRadius: '60%',
                  overflow: 'hidden',
                  marginBottom: 10
                }}
                alt="Weston"
              />
              <Text style="h4" color="primary">Ihsan Fauzi Rahman</Text>
              <Text>aka Ryuzaki01</Text>
              <Text style="h5">Lead Developer</Text>
              <Flex
                css={{
                  gap: 10
                }}
              >
                <Link href="https://www.linkedin.com/in/ihsan-fauzi-rahman/" target="_blank">
                  <FontAwesomeIcon icon={faLinkedin} size="lg" color="#fff" />
                </Link>
                <Link href="https://github.com/ryuzaki01" target="_blank">
                  <FontAwesomeIcon icon={faGithub} size="lg" color="#fff" />
                </Link>
                <Link href="https://x.com/ShinjiKagehisa/" target="_blank">
                  <FontAwesomeIcon icon={faTwitter} size="lg" color="#fff" />
                </Link>
                <Link href="https://discordapp.com/users/210760420766515210" target="_blank">
                  <FontAwesomeIcon icon={faDiscord} size="lg" color="#fff" />
                </Link>
              </Flex>
            </Flex>
            <Flex
              direction="column"
              align="center"
            >
              <Image
                src="/images/profile/maestro.png"
                width={80}
                height={80}
                style={{
                  borderRadius: '60%',
                  overflow: 'hidden',
                  marginBottom: 10
                }}
                alt="Weston"
              />
              <Text style="h4" color="primary">Elias Pederiva</Text>
              <Text>aka Maestro</Text>
              <Text style="h5">Marketer, Advisor</Text>
              <Flex
                css={{
                  gap: 10
                }}
              >
                <Link href="https://x.com/0xMaestro/" target="_blank">
                  <FontAwesomeIcon icon={faTwitter} size="lg" color="#fff" />
                </Link>
                <Link href="https://discordapp.com/users/896166209932886040" target="_blank">
                  <FontAwesomeIcon icon={faDiscord} size="lg" color="#fff" />
                </Link>
              </Flex>
            </Flex>
            <Flex
              direction="column"
              align="center"
            >
              <Image
                src="/images/profile/joey.png"
                width={80}
                height={80}
                style={{
                  borderRadius: '60%',
                  overflow: 'hidden',
                  marginBottom: 10
                }}
                alt="Weston"
              />
              <Text style="h4" color="primary">SirJoey</Text>
              <Text>-</Text>
              <Text style="h5">Head of Business Dev</Text>
              <Flex
                css={{
                  gap: 10
                }}
              >
                <Link href="https://x.com/_SirJoey/" target="_blank">
                  <FontAwesomeIcon icon={faTwitter} size="lg" color="#fff" />
                </Link>
                <Link href="https://discordapp.com/users/239724646465929216" target="_blank">
                  <FontAwesomeIcon icon={faDiscord} size="lg" color="#fff" />
                </Link>
              </Flex>
            </Flex>
          </Flex>
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  }
}

type TopSellingCollectionsSchema =
  paths['/collections/top-selling/v1']['get']['responses']['200']['schema']

type ChainTopSellingCollections = Record<string, TopSellingCollectionsSchema>

type CollectionSchema =
  paths['/collections/v5']['get']['responses']['200']['schema']
type ChainCollections = Record<string, CollectionSchema>

export const getStaticProps: GetStaticProps<{
  ssr: {
    topSellingCollections: ChainTopSellingCollections
  }
}> = async ({ params }) => {
  const now = new Date()
  const timestamp = Math.floor(now.getTime() / 1000)
  const startTime = timestamp - 1440 * 60 // 24hrs ago

  let topSellingCollectionsQuery: paths['/collections/top-selling/v1']['get']['parameters']['query'] =
    {
      startTime: startTime,
      fillType: 'sale',
      limit: 10,
      includeRecentSales: true,
    }

  const chain = supportedChains.find((chain) => params?.chain === chain.routePrefix) ||
    DefaultChain
  const response = await fetcher(`${chain.reservoirBaseUrl}/collections/top-selling/v1`, topSellingCollectionsQuery, {
    headers: {
      'x-api-key': chain.apiKey || '',
    },
  })

  const topSellingCollections: ChainTopSellingCollections = {}

  supportedChains.forEach((c) => {
    if (c.id === chain.id) {
      topSellingCollections[c.id] = response.data
      return
    }

    topSellingCollections[c.id] = {
      collections: []
    }
  })

  return {
    props: { ssr: { topSellingCollections } },
    revalidate: 5,
  }
}

export default IndexPage
