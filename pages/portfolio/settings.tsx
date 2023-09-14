import { useState } from 'react'
import { useTheme } from 'next-themes'
import {useAccount} from "wagmi"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faGear, faGift} from '@fortawesome/free-solid-svg-icons'
import { Text, Flex, Box, Grid } from 'components/primitives'
import Layout from 'components/Layout'
import SettingsContentContainer from "components/portfolio/SettingsContentContainer"
import DetailsSettings from 'components/portfolio/DetailsSettings'
import LoadingSpinner from "components/common/LoadingSpinner";
import {useProfile} from "hooks";
import {
  GetServerSideProps,
  InferGetServerSidePropsType,
  NextPage
} from "next";

type Props = InferGetServerSidePropsType<typeof getServerSideProps>

const PortfolioSettings : NextPage<Props> = ({ ssr }) => {
  const [activeTab, setActiveTab] = useState<string | null>('details')
  const { address, isConnecting } = useAccount()

  const {
    data: profile,
    mutate,
    isLoading,
    isValidating,
  } = useProfile(
    address,
    {
      revalidateOnMount: true,
      fallbackData: [ssr.profile],
      revalidateIfStale: false,
    }
  )

  const getCssTab = (tab: string) => ({
    tab: {
      cursor: 'pointer',
      width: '100%',
      padding: '4px 12px',
      color: activeTab === tab ? '$primary10' : '$gray10',
      borderLeft: `solid 2px ${activeTab === tab ? '$primary10' : '$gray10'}`,
      marginBottom: 20
    },
    text: {
      ml: 12,
      fontSize: 14,
      fontWeight: 'bold',
      color: activeTab === tab ? '$primary10' : '$gray10',
    }
  })

  if (!ssr.profile) {
    return (
      <Layout>
        <Flex align="center" justify="center" css={{ py: '40vh' }}>
          <LoadingSpinner />
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
        }}>
        <Text style='h6' css={{ fontWeight: 'bold' }}>
          Profile Settings
        </Text>
        <Grid css={{
          marginTop: 18,
          width: '100%',
          '@md': {
            gridTemplateColumns: '3fr 9fr',
          },
          '@lg': {
            gridTemplateColumns: '2fr 10fr',
          },
        }}>
          <Flex
            direction='column'
            css={{
              widht: '100%',
              display: 'none',
              '@md': {
                display: 'flex'
              },
            }}>
            <Box>
              <Flex
                align='center'
                onClick={() => setActiveTab('details')}
                css={getCssTab('details').tab}>
                <Box css={{ width: 16 }}>
                  <FontAwesomeIcon icon={faGear} />
                </Box>
                <Text css={getCssTab('details').text}>Details</Text>
              </Flex>
              <Flex
                align='center'
                // onClick={() => setActiveTab('details')}
                css={getCssTab('referral').tab}>
                <Box css={{ width: 16 }}>
                  <FontAwesomeIcon icon={faGift} />
                </Box>
                <Text css={getCssTab('referral').text}>Referral (Soon)</Text>
              </Flex>
            </Box>
          </Flex>
          <Box
            css={{
              width: '100%'
            }}>
            <SettingsContentContainer
              tab='details'
              tabLabel='details'
              activeTab={activeTab}
              icon={faGear}
              setActiveTab={() => setActiveTab('details')}>
              <DetailsSettings
                profile={profile}
              />
            </SettingsContentContainer>
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
}> = async ({ params }) => {
  const profile = {}

  return {
    props: { ssr: { profile } }
  }
}

export default PortfolioSettings
