import { ListModal, ListStep, useTokens } from '@reservoir0x/reservoir-kit-ui'
import {
  cloneElement,
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  useContext,
} from 'react'
import { CSS } from '@stitches/react'
import { SWRResponse } from 'swr'
import {
  useAccount,
  useNetwork,
  useWalletClient,
  useSwitchNetwork,
} from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { useMarketplaceChain } from 'hooks'
import { mainnet, arbitrum, optimism, polygon, bsc, polygonMumbai } from "wagmi/chains";
import { zeroAddress } from 'viem'

import { Button } from 'components/primitives'
import { ToastContext } from 'context/ToastContextProvider'
import { base } from 'utils/chains'

type ListingCurrencies = ComponentPropsWithoutRef<
  typeof ListModal
>['currencies']

type Props = {
  token?: ReturnType<typeof useTokens>['data'][0]
  buttonCss?: CSS
  buttonChildren?: ReactNode
  buttonProps?: ComponentProps<typeof Button>
  mutate?: SWRResponse['mutate']
}

const List: FC<Props> = ({
  token,
  buttonCss,
  buttonChildren,
  buttonProps,
  mutate,
}) => {
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)

  const marketplaceChain = useMarketplaceChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  const { data: signer } = useWalletClient()
  const { chain: activeChain } = useNetwork()

  const isInTheWrongNetwork = Boolean(
    signer && marketplaceChain.id !== activeChain?.id
  )

  // CONFIGURABLE: Here you can configure which currencies you would like to support for listing
  let listingCurrencies: ListingCurrencies = undefined
  if (marketplaceChain.id === mainnet.id) {
    listingCurrencies = [
      {
        contract: zeroAddress,
        symbol: 'ETH',
        coinGeckoId: 'ethereum',
      },
      {
        contract: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },
    ]
  }

  if (marketplaceChain.id === arbitrum.id) {
    listingCurrencies = [
      {
        contract: zeroAddress,
        symbol: 'ETH',
        coinGeckoId: 'ethereum',
      },
      {
        contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },
      /*{
        contract: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        symbol: 'ARB',
        decimals: 18,
        coinGeckoId: 'arbitrum',
      }*/
    ]
  }

  if (marketplaceChain.id === optimism.id) {
    listingCurrencies = [
      {
        contract: zeroAddress,
        symbol: 'ETH',
        coinGeckoId: 'ethereum',
      },
      /*{
        contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },/*
      /*{
        contract: '0x4200000000000000000000000000000000000042',
        symbol: 'OP',
        decimals: 18,
        coinGeckoId: 'optimism',
      }*/
    ]
  }


  if (marketplaceChain.id === polygon.id) {
    listingCurrencies = [
      {
        contract: zeroAddress,
        symbol: 'MATIC',
        coinGeckoId: 'matic-network',
      },
      {
        contract: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
        symbol: 'WMATIC',
        decimals: 18,
        coinGeckoId: 'matic-network',
      },
      {
        contract: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        symbol: 'WETH',
        decimals: 18,
        coinGeckoId: 'ethereum',
      },
      {
        contract: '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },
     
    ]
  }

  if (marketplaceChain.id === base.id) {
    listingCurrencies = [
      {
        contract: zeroAddress,
        symbol: 'ETH',
        coinGeckoId: 'ethereum',
      },
      {
        contract: '0xc2106ca72996e49bBADcB836eeC52B765977fd20',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },
    ]
  }
  const tokenId = token?.token?.tokenId
  const contract = token?.token?.contract

  const trigger = (
    <Button css={buttonCss} color="primary" {...buttonProps}>
      {buttonChildren}
    </Button>
  )

  if (isDisconnected || isInTheWrongNetwork) {
    return cloneElement(trigger, {
      onClick: async () => {
        if (switchNetworkAsync && activeChain) {
          const chain = await switchNetworkAsync(marketplaceChain.id)
          if (chain.id !== marketplaceChain.id) {
            return false
          }
        }

        if (!signer) {
          openConnectModal?.()
        }
      },
    })
  } else
    return (
      <ListModal
        trigger={trigger}
        collectionId={contract}
        tokenId={tokenId}
        currencies={listingCurrencies}
        onClose={(data, stepData, currentStep) => {
          if (mutate && currentStep == ListStep.Complete) mutate()
        }}
        onListingError={(err: any) => {
          if (err?.code === 4001) {
            addToast?.({
              title: 'User canceled transaction',
              description: 'You have canceled the transaction.',
            })
            return
          }
          addToast?.({
            title: 'Could not list token',
            description: 'The transaction was not completed.',
          })
        }}
      />
    )
}

export default List
