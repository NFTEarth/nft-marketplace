import {useContext, useEffect, useState} from "react";
import {useAccount, useNetwork, useSwitchNetwork} from "wagmi";
import {Web3Provider} from "@ethersproject/providers";
import uniswapToken from '@uniswap/default-token-list'
import {useConnectModal} from "@rainbow-me/rainbowkit";
import { SwapWidget, darkTheme, AddEthereumChainParameter } from '@nftearth/uniswap-widgets'
import '@nftearth/uniswap-widgets/fonts.css'

import { Footer } from "components/Footer";
import Layout from "../components/Layout";
import {Box, Flex} from "../components/primitives";
import {OFT_CHAINS} from "../utils/chains";
import {useMarketplaceChain, useMounted} from "../hooks";
import {ToastContext} from "../context/ToastContextProvider";
import {parseError} from "../utils/error";
import {arbitrum} from "viem/chains";
import ChainToggle from "../components/common/ChainToggle";
import AlertChainSwitch from "../components/common/AlertChainSwitch";

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
        '42170': {
          tokenAddress: '0x90aec282ed4cdcaab0934519de08b56f1f2ab4d7',
        },
        '42161': {
          tokenAddress: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        },
      },
    },
  },
  {
    chainId: 42170,
    address: '0x90aec282ed4cdcaab0934519de08b56f1f2ab4d7',
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

const SwapPage = () => {
  const mounted = useMounted()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)
  const marketplaceChain = useMarketplaceChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })
  const chain = OFT_CHAINS.find(c => c.id === marketplaceChain?.id)
  const allowedTokenSymbols = marketplaceChain?.id === arbitrum.id ? [ 'ETH', 'NFTE', 'ARB'] : [ 'ETH', 'NFTE']
  const tokenList = [...uniswapToken.tokens, ...nfteTokens]
    .filter((token) => token.chainId === (marketplaceChain?.id || 42161) && allowedTokenSymbols.includes(token.symbol))
  const [provider, setProvider] = useState<Web3Provider | undefined>()
  const { connector, isConnected } = useAccount()
  useEffect(() => {
    if (!connector) {
      return () => setProvider(undefined)
    }

    connector.getProvider({
      chainId: marketplaceChain.id,
    }).then((provider) => {
      setProvider(new Web3Provider(provider, marketplaceChain.id))
    })
  }, [connector, marketplaceChain.id])


  return (
    <Layout>
      <AlertChainSwitch chainId={marketplaceChain.id}/>
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
            pb: 200,
            pt: 50,
            gap: 40,
            alignItems: 'center',
            '@md': {
              mx: 20,
            }
          }}
        >
          <ChainToggle />
          {mounted && (
            <SwapWidget
              permit2
              hideConnectionUI={isConnected}
              tokenList={tokenList}
              brandedFooter={false}
              onSwitchChain={(params: AddEthereumChainParameter) => {
                switchNetworkAsync?.(+params.chainId)
              }}
              defaultOutputTokenAddress={chain?.address}
              onConnectWalletClick={() => openConnectModal?.()}
              provider={provider}
              onError={(error: any) => {
                const { name, message } = parseError(error)
                addToast?.({
                  title: name,
                  status: 'error',
                  description: message
                })
              }}
              theme={{
                ...darkTheme,
                container: 'hsl(240,2%,11%)',
                module: 'hsl(220,4%,16%)',
                accent: '#a97aff',
                accentSoft: '#8eff7a',
                interactive: 'hsl(263,29%,22%)',
                outline: 'hsl(264,33%,16%)',
                dialog: '#000',
                scrim: 'hsla(224, 33%, 16%, 0.5)',

                // text
                onAccent: '#fff',
                primary: '#fff',
                secondary: 'hsl(227, 21%, 67%)',
                hint: 'hsl(92,18%,44%)',
                onInteractive: '#fff',

                deepShadow: 'hsla(0, 0%, 0%, 0.32), hsla(0, 0%, 0%, 0.24), hsla(0, 0%, 0%, 0.24)',
                networkDefaultShadow: 'hsla(270,96%,64%, 0.16)',
              }}
            />
          )}
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default SwapPage