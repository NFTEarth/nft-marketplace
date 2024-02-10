import { useEffect, useState } from 'react'
import { useAccount, useConnect, useSignMessage } from 'wagmi'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faGear, faEnvelope, faGift } from '@fortawesome/free-solid-svg-icons'
import { faXTwitter, faFontAwesome } from '@fortawesome/free-brands-svg-icons'
import { useSession } from 'next-auth/react'
import { signIn } from 'next-auth/react'
import { Text, Flex, Box, Grid, Button } from 'components/primitives'
import Layout from 'components/Layout'
import SettingsContentContainer from 'components/portfolio/SettingsContentContainer'
import DetailsSettings from 'components/portfolio/DetailsSettings'
import LoadingSpinner from 'components/common/LoadingSpinner'
import { useProfile } from 'hooks'
import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next'
import { recoverMessageAddress } from 'viem'
import { AuthOptions, getServerSession } from 'next-auth'
import { authOptions } from '../api/auth/[...nextauth]'

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const PortfolioSettings: NextPage<Props> = ({ ssr }) => {
  const [activeTab, setActiveTab] = useState<string | null>('details')
  const { data, update } = useSession()
  const {
    data: signMessageData,
    error,
    isLoading: isLoadingSignature,
    signMessage,
    variables,
  } = useSignMessage()

  const {
    data: profile,
    isLoading,
    isValidating,
  } = useProfile(
    // @ts-ignore
    data?.wallet,
    {
      revalidateOnMount: false,
      fallbackData: ssr.profile,
      revalidateIfStale: false,
    }
  )

  useEffect(() => {
    ;(async () => {
      if (variables?.message && signMessageData) {
        const recoveredAddress = await recoverMessageAddress({
          message: variables?.message,
          signature: signMessageData,
        })

        await signIn('credentials', {
          redirect: false,
          wallet: recoveredAddress,
        })
        await update()
      }
    })()
  }, [signMessageData, variables?.message])

  useEffect(() => {
    if (!data) {
      signMessage({
        message: 'NFTEarth: Please sign in with your Ethereum wallet.',
      })
    }
  }, [data])

  const getCssTab = (tab: string) => ({
    tab: {
      cursor: 'pointer',
      width: '100%',
      padding: '4px 12px',
      color: activeTab === tab ? '$primary10' : '$gray10',
      borderLeft: `solid 2px ${activeTab === tab ? '$primary10' : '$gray10'}`,
      marginBottom: 20,
    },
    text: {
      ml: 12,
      fontSize: 14,
      fontWeight: 'bold',
      color: activeTab === tab ? '$primary10' : '$gray10',
    },
  })

  if (isLoadingSignature || isLoadingSignature) {
    return (
      <Layout>
        <Flex align="center" justify="center" css={{ py: '40vh' }}>
          <LoadingSpinner />
        </Flex>
      </Layout>
    )
  }

  if (!profile) {
    return (
      <Layout>
        <Flex
          direction="column"
          align="center"
          justify="center"
          css={{ py: '40vh', gap: 20 }}
        >
          <Text>NFTEarth: Please sign in with your Ethereum wallet. </Text>
          <Button
            onClick={() => {
              signMessage({
                message: 'NFTEarth: Please sign in with your Ethereum wallet.',
              })
            }}
          >
            Sign
          </Button>
        </Flex>
      </Layout>
    )
  }

  return (
    <Layout>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$5',
          },
        }}
      >
        <Text style="h6" css={{ fontWeight: 'bold' }}>
          Profile Settings
        </Text>
        <Grid
          css={{
            marginTop: 18,
            width: '100%',
            '@md': {
              gridTemplateColumns: '3fr 9fr',
            },
            '@lg': {
              gridTemplateColumns: '2fr 10fr',
            },
          }}
        >
          <Flex
            direction="column"
            css={{
              widht: '100%',
              display: 'none',
              '@md': {
                display: 'flex',
              },
            }}
          >
            <Box>
              <Flex
                align="center"
                onClick={() => setActiveTab('details')}
                css={getCssTab('details').tab}
              >
                <Box css={{ width: 16 }}>
                  <FontAwesomeIcon icon={faGear} />
                </Box>
                <Text css={getCssTab('details').text}>Details</Text>
              </Flex>
              {/*<Flex*/}
              {/*  align='center'*/}
              {/*  // onClick={() => setActiveTab('details')}*/}
              {/*  css={getCssTab('referral').tab}>*/}
              {/*  <Box css={{ width: 16 }}>*/}
              {/*    <FontAwesomeIcon icon={faGift} />*/}
              {/*  </Box>*/}
              {/*  <Text css={getCssTab('referral').text}>Your Referral Dashboard (Coming Soon)</Text>*/}
              {/*</Flex>*/}
            </Box>
          </Flex>
          <Box
            css={{
              width: '100%',
            }}
          >
            <SettingsContentContainer
              tab="details"
              tabLabel="details"
              activeTab={activeTab}
              icon={faGear}
              setActiveTab={() => setActiveTab('details')}
            >
              <DetailsSettings profile={profile} />
            </SettingsContentContainer>
            {/*<SettingsContentContainer*/}
            {/*  tab='referral'*/}
            {/*  tabLabel='referral'*/}
            {/*  activeTab={activeTab}*/}
            {/*  icon={faGift}*/}
            {/*  setActiveTab={() => setActiveTab('referral')}>*/}
            {/*  <Flex/>*/}
            {/*</SettingsContentContainer>*/}
          </Box>
        </Grid>
      </Box>
    </Layout>
  )
}

export const getServerSideProps: GetServerSideProps<{
  ssr: {
    profile?: any
  }
}> = async ({ req, res }) => {
  const session: any = await getServerSession(
    req,
    res,
    authOptions as AuthOptions
  )

  const profile = session
    ? await fetch(
        `${process.env.NEXT_PUBLIC_HOST_URL}/api/profile?address=${session.wallet}`
      )
        .then((res) => res.json())
        .catch(() => null)
    : null

  return {
    props: { ssr: { profile } },
  }
}

export default PortfolioSettings
