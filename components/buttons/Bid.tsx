import { BidModal, BidStep } from '@reservoir0x/reservoir-kit-ui'
import { Button } from 'components/primitives'
import {
  cloneElement,
  ComponentProps,
  ComponentPropsWithoutRef,
  FC,
  useContext,
} from 'react'
import { CSS } from '@stitches/react'
import { SWRResponse } from 'swr'
import {
  useAccount,
  useNetwork,
  useWalletClient,
  mainnet,
  useSwitchNetwork,
} from 'wagmi'
import { useConnectModal } from '@rainbow-me/rainbowkit'
import { ToastContext } from 'context/ToastContextProvider'
import { useMarketplaceChain } from 'hooks'
import {arbitrum, polygon} from "wagmi/chains";

type Props = {
  tokenId?: string | undefined
  collectionId?: string | undefined
  disabled?: boolean
  openState?: [boolean, React.Dispatch<React.SetStateAction<boolean>>]
  buttonCss?: CSS
  buttonProps?: ComponentProps<typeof Button>
  mutate?: SWRResponse['mutate']
}

type BiddingCurrencies = ComponentPropsWithoutRef<typeof BidModal>['currencies']

const Bid: FC<Props> = ({
  tokenId,
  collectionId,
  disabled,
  openState,
  buttonCss,
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

  const trigger = (
    <Button css={buttonCss} disabled={disabled} {...buttonProps} color="gray3">
      Make Offer
    </Button>
  )

  // CONFIGURABLE: Here you can configure which currencies you would like to support for bidding
  let bidCurrencies: BiddingCurrencies = undefined
  if (marketplaceChain.id === mainnet.id) {
    bidCurrencies = [
      {
        contract: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
        symbol: 'WETH',
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
  if (marketplaceChain.id === polygon.id) {
    bidCurrencies = [
      {
        contract: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
        symbol: 'WETH',
        coinGeckoId: 'ethereum',
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
      <BidModal
        tokenId={tokenId}
        collectionId={collectionId}
        trigger={trigger}
        openState={openState}
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
    )
}

export default Bid
