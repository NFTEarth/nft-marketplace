import { FC } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'

import Box from 'components/primitives/Box'
import Button from 'components/primitives/Button'

type Props = {}

export const ConnectWalletButton: FC<Props> = () => {
  return (
    <ConnectButton.Custom>
      {({ account, chain, openConnectModal, mounted }) => {
        return (
          <Box
            style={{
              flex: '1',
              display: 'flex',
              justifyContent: 'flex',
            }}
          >
            {(() => {
              if (!mounted || !account || !chain) {
                return (
                  <Button
                    css={{ flex: 1, color:"#000", justifyContent: 'center' }}
                    corners="rounded"
                    onClick={openConnectModal}
                    type="button"
                  >
                    Login
                  </Button>
                )
              }
            })()}
          </Box>
        )
      }}
    </ConnectButton.Custom>
  )
}
