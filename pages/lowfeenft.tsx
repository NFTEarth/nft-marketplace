import {Box} from "../components/primitives";
import Layout from "../components/Layout";
import {Footer} from "../components/Footer";

const LowFeeNFTMint = () => {
  return (
    <Layout>
      <iframe
        src="https://lowfeenft.nftearth.exchange/"
        style={{
          width: '100%',
          height: 1000
        }}
      />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Footer />
      </Box>
    </Layout>
  )
}

export default LowFeeNFTMint;