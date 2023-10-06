import React, {FC, useMemo} from 'react'
import { StyledComponent } from '@stitches/react/types/styled-component'
import { useReservoirClient } from '@reservoir0x/reservoir-kit-ui'
import { zeroAddress } from 'viem'

import { styled } from 'stitches.config'
import {OFT_CHAINS} from "utils/chains";

type Props = {
  address: string
  chainId?: number
} & Parameters<StyledComponent>['0']

const StyledImg = styled('img', {})

const CryptoCurrencyIcon: FC<Props> = ({
                                         address = zeroAddress,
                                         chainId,
                                         css,
                                       }) => {
  const client = useReservoirClient()
  const chain = client?.chains?.find((chain) =>
    chainId !== undefined ? chain.id === chainId : chain.active
  )

  const tokenChain = OFT_CHAINS.find(c => c.id === chain?.id)

  const imageSrc = useMemo(() => {
    const isNFTE = address.toLowerCase() === tokenChain?.address.toLowerCase()
    const isXNFTE = address.toLowerCase() === tokenChain?.xNFTE?.toLowerCase()
    const isNFTELP = address.toLowerCase() === tokenChain?.LPNFTE?.toLowerCase()
    const isARB = address.toLowerCase() === '0x912CE59144191C1204E64559FE8253a0e49E6548'.toLowerCase()

    if (isNFTE) {
      return '/icons/currency/nfte.png'
    }

    if (isXNFTE) {
      return '/icons/currency/xnfte.svg'
    }

    if (isNFTELP) {
      return '/icons/currency/nftelp.svg'
    }

    if (isARB) {
      return '/icons/currency/arb.png'
    }

    return `${chain?.baseApiUrl}/redirect/currency/${address}/icon/v1`;
  }, [address, tokenChain, chain])

  return (
    <StyledImg
      src={imageSrc}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
