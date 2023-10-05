// import { SwapWidget } from '@nftearth/uniswap-widgets'
// import '@nftearth/uniswap-widgets/fonts.css'

import { Footer } from "components/Footer";
import Layout from "../components/Layout";
import {Box} from "../components/primitives";

const SwapPage = () => {
  return (
    <Layout>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        {/*<SwapWidget />*/}
        <Footer />
      </Box>
    </Layout>
  )
}

export default SwapPage