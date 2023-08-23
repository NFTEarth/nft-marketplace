import {Head} from "../../components/Head";
import {Box, Flex, Text} from "../../components/primitives";
import Layout from "../../components/Layout";
import {faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import Link from "next/link";

const FortuneHistory = () => {
  return (
    <Layout>
      <Head title={"History • Fortune | NFTEarth"}/>
      <Box
        css={{
          py: 24,
          px: '$6',
          height: '100%',
          pb: 160,
          '@md': {
            pb: 60,
          },
        }}
      >
        <Flex justify="center" css={{ mb: 30 }}>
          <Text style="h5">Fortune</Text>
        </Flex>
        <Flex
          direction="column"
        >
          <Flex justify="between">
            <Flex
              direction="column"
              css={{
                gap: 20
              }}
            >
              <Link href="/fortune">
                <Flex align="center" css={{ gap: 20 }}>
                  <FontAwesomeIcon icon={faArrowLeft} width={16} height={16} color="hsl(145, 25%, 39%)" />
                  <Text css={{ color: '$primary13' }}>Current Round</Text>
                </Flex>
              </Link>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Layout>
  )
}

export default FortuneHistory;