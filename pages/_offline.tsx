import {Box, Flex, Text} from "../components/primitives";
import Layout from "../components/Layout";

const OfflinePage = () => {
  return (
    <Layout>
      <Box
        css={{
          py: 24,
          px: '$3',
          height: '100%',
          pb: 20,
          '@md': {
            pb: 60,
            px: '$6',
          },
        }}
      >
        <Flex
          align="center"
          justify="center"
          direction="column"
          css={{
            p: 40,
            height: '80vh',
            gap: 40,
            textAlign: 'center'
          }}
        >
          <Text style="h4">{`You are offline`}</Text>
        </Flex>
      </Box>
    </Layout>
  )
}

export default OfflinePage