import uniswapToken from '@uniswap/default-token-list'
import { JsonRpcProvider } from 'ethers'
import {useNetwork} from "wagmi";
import '@nftearth/uniswap-widgets/fonts.css'
const { SwapWidget, darkTheme } = require('@nftearth/uniswap-widgets')

import { Footer } from "components/Footer";
import Layout from "../components/Layout";
import {Box, Flex} from "../components/primitives";
import {getAlchemyNetworkName, OFT_CHAINS} from "../utils/chains";
import {useMounted} from "../hooks";
import {useContext} from "react";
import {ToastContext} from "../context/ToastContextProvider";
import {parseError} from "../utils/error";


const nfteTokens = [
  {
    chainId: 1,
    address: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
    name: 'NFTEarthOFT',
    symbol: 'NFTE',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/25305.png',
    extensions: {
      bridgeInfo: {
        '10': {
          tokenAddress: '0x8637725aDa78db0674a679CeA2A5e0A0869EF4A1',
        },
        '137': {
          tokenAddress: '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20',
        },
        '42161': {
          tokenAddress: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        },
      },
    },
  },
  {
    chainId: 10,
    address: '0x8637725aDa78db0674a679CeA2A5e0A0869EF4A1',
    name: 'NFTEarthOFT',
    symbol: 'NFTE',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/25305.png',
    extensions: {
      bridgeInfo: {
        '1': {
          tokenAddress: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
        },
      },
    },
  },
  {
    chainId: 42161,
    address: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
    name: 'NFTEarthOFT',
    symbol: 'NFTE',
    decimals: 18,
    logoURI: 'https://s2.coinmarketcap.com/static/img/coins/64x64/25305.png',
    extensions: {
      bridgeInfo: {
        '1': {
          tokenAddress: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
        },
      },
    },
  },
]

const allowedTokenSymbols = ['WETH', 'ETH', 'USDC', 'DAI', 'NFTE', 'ARB']

const SwapPage = () => {
  const { chain: activeChain } = useNetwork()
  const mounted = useMounted()
  const { addToast } = useContext(ToastContext)
  const chain = OFT_CHAINS.find(c => c.id === activeChain?.id)
  const tokenList = [...uniswapToken.tokens, ...nfteTokens]
    .filter((token) => token.chainId === (activeChain?.id || 42161) && allowedTokenSymbols.includes(token.symbol))
  const alchemyAPIUrl = `https://${getAlchemyNetworkName(activeChain?.id || 42161)}.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_ID}`
  const provider = new JsonRpcProvider(alchemyAPIUrl)

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
        <Flex
          direction="column"
          css={{
            mx: 20,
            pb: 150,
            pt: 100,
            '@md': {
              alignItems: 'center'
            }
          }}
        >
          {mounted && (
            <SwapWidget
              permit2
              theme={{
                ...darkTheme,
                container: '#1d1d1d',
                module: '#222222',
                accent: '#a97aff'
              }}
              tokenList={tokenList}
              settings={{
                slippage: {
                  auto: true
                }
              }}
              onError={(error: any) => {
                const { name, message } = parseError(error)
                addToast?.({
                  title: name,
                  status: 'error',
                  description: message
                })
              }}
              brandedFooter={false}
              hideConnectionUI
              convenienceFee={100}
              convenienceFeeRecipient="0xd55c6b0a208362b18beb178e1785cf91c4ce937a"
              defaultOutputTokenAddress={chain?.address}
            />
          )}
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default SwapPage