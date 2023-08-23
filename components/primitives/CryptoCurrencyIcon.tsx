import React, { FC } from 'react'
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
  const isNFTE = address.toLowerCase() === tokenChain?.address.toLowerCase()

  return (
    <StyledImg
      src={isNFTE ? '/icons/currency/nfte.png' : `${chain?.baseApiUrl}/redirect/currency/${address}/icon/v1`}
      css={css}
    />
  )
}

export default CryptoCurrencyIcon
