import {Box} from "../components/primitives";
import Layout from "../components/Layout";
import {Footer} from "../components/Footer";
import { styled } from 'stitches.config'

export const Iframe = styled('iframe', {})

const LowFeeNFTMint = () => {
  return (
    <Layout>
      <Iframe
        src="https://lowfeenft.nftearth.exchange/"
        css={{
          width: '100%',
          height: 670,
          '@bp800': {
            height: 1000,
          },
        }}
      />
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
          pt: 0,
        }}
      >
        <Footer />
      </Box>
    </Layout>
  )
}

export default LowFeeNFTMint;