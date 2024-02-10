import { BidModal, BidStep, Trait } from '@reservoir0x/reservoir-kit-ui'
import { Button } from 'components/primitives'
import { useRouter } from 'next/router'
import {
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react'
import {
  mainnet,
  useAccount,
  useNetwork,
  useWalletClient,
  useSwitchNetwork,
} from 'wagmi'
import { useCollections } from '@reservoir0x/reservoir-kit-ui'
import { SWRResponse } from 'swr'
import { CSS } from '@stitches/react'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from 'context/ToastContextProvider'
import { useMarketplaceChain } from 'hooks'
import { arbitrum } from "wagmi/chains";
import { zeroAddress } from 'viem'
import { polygon } from 'viem/chains'


type Props = {
  collection: NonNullable<ReturnType<typeof useCollections>['data']>[0]
  mutate?: SWRResponse['mutate']
  buttonCss?: CSS
  buttonChildren?: ReactNode
  buttonProps?: ComponentProps<typeof Button>
}

type BiddingCurrencies = ComponentPropsWithoutRef<typeof BidModal>['currencies']

const CollectionOffer: FC<Props> = ({
  collection,
  mutate,
  buttonCss,
  buttonChildren,
  buttonProps = {},
}) => {
  const router = useRouter()
  const marketplaceChain = useMarketplaceChain()
  const [attribute, setAttribute] = useState<Trait>(undefined)
  const { data: signer } = useWalletClient()
  const { chain: activeChain } = useNetwork()
  const { isDisconnected } = useAccount()
  const { openConnectModal } = useConnectModal()
  const { addToast } = useContext(ToastContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  useEffect(() => {
    const keys = Object.keys(router.query)
    const attributesSelected = keys.filter(
      (key) =>
        key.startsWith('attributes[') &&
        key.endsWith(']') &&
        router.query[key] !== '' &&
        !Array.isArray(router.query[key])
    )

    // Only enable the attribute modal if one attribute is selected
    if (attributesSelected.length !== 1) {
      setAttribute(undefined)
      return
    }

    const value = router.query[attributesSelected[0]]?.toString()
    const key = attributesSelected[0].slice(11, -1)

    if (key && value) {
      setAttribute({
        key,
        value,
      })
    }
  }, [router.query])

  const isSupported = !!collection?.collectionBidSupported
  const isInTheWrongNetwork = Boolean(
    signer && activeChain?.id !== marketplaceChain.id
  )
  const isAttributeModal = !!attribute

  // CONFIGURABLE: Here you can configure which currencies you would like to support for bidding
  let bidCurrencies: BiddingCurrencies = undefined
  if (marketplaceChain.id === mainnet.id) {
    bidCurrencies = [
      {
        contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
        coinGeckoId: 'weth',
      },
      {
        contract: '0x8c223a82E07feCB49D602150d7C2B3A4c9630310',
        symbol: 'NFTE',
        decimals: 18,
        coinGeckoId: 'nftearth',
      },
    ]
  }
  if (marketplaceChain.id === polygon.id) {
  bidCurrencies = [
    {
      contract: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
      symbol: 'WETH',
      coinGeckoId: 'weth',
    },
    {
      contract: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
      symbol: 'WMATIC',
      decimals: 18,
      coinGeckoId: 'wmatic',
    },
    {
      contract: '0x492Fa53b88614923937B7197C87E0F7F8EEb7B20',
      symbol: 'NFTE',
      decimals: 18,
      coinGeckoId: 'nftearth',
    },
  ]
}

  if (marketplaceChain.id === arbitrum.id) {
    bidCurrencies = [
      {
        contract: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        symbol: 'WETH',
        decimals: 18,
        coinGeckoId: 'weth',
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

  const trigger = (
    <Button css={buttonCss} color="primary" {...buttonProps}>
      {buttonChildren
        ? buttonChildren
        : isAttributeModal
        ? 'Attribute Offer'
        : 'Collection Offer'}
    </Button>
  )

  if (isDisconnected || isInTheWrongNetwork) {
    return (
      <Button
        css={buttonCss}
        disabled={isInTheWrongNetwork && !switchNetworkAsync}
        onClick={async () => {
          if (isInTheWrongNetwork && switchNetworkAsync) {
            const chain = await switchNetworkAsync(marketplaceChain.id)
            if (chain.id !== marketplaceChain.id) {
              return false
            }
          }

          if (!signer) {
            openConnectModal?.()
          }
        }}
        {...buttonProps}
      >
        {buttonChildren
          ? buttonChildren
          : isAttributeModal
          ? 'Attribute Offer'
          : 'Collection Offer'}
      </Button>
    )
  } else
    return (
      <>
        {isSupported && (
          <BidModal
            collectionId={collection?.id}
            trigger={trigger}
            attribute={attribute}
            currencies={bidCurrencies}
            onClose={(data, stepData, currentStep) => {
              if (mutate && currentStep == BidStep.Complete) mutate()
            }}
            onBidError={(error) => {
              if (error) {
                if (
                  (error as any).cause.code &&
                  (error as any).cause.code === 4001
                ) {
                  addToast?.({
                    title: 'User canceled transaction',
                    description: 'You have canceled the transaction.',
                  })
                  return
                }
              }
              addToast?.({
                title: 'Could not place bid',
                description: 'The transaction was not completed.',
              })
            }}
          />
        )}
      </>
    )
}

export default CollectionOffer
