import { FC, ReactNode } from 'react'
import Script from "next/script";
import { Box } from 'components/primitives'
import Navbar from './navbar'
import {useMounted} from 'hooks'
import {useMediaQuery} from "react-responsive";


type Props = {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <>
      <Box
        css={{
          background: '$neutralBg',
          height: '100%',
          minHeight: '100vh',
          pt: 80,
        }}
      >
        <Box css={{ maxWidth: 1920, mx: 'auto' }}>
          <Navbar />
          <main>{children}</main>
        </Box>
      </Box>
      {/*<Script*/}
      {/*  src="https://cdn.jsdelivr.net/npm/@widgetbot/crate@3"*/}
      {/*  async*/}
      {/*  defer*/}
      {/*>*/}
      {/*  {`new Crate({*/}
      {/*    server: '1062256160264171520',*/}
      {/*    channel: '1146477051033956544',*/}
      {/*    color: 'transparent',*/}
      {/*    notifications: true,*/}
      {/*    glyph: ['https://nftearth.exchange/images/chat-discord.svg', '60px'],*/}
      {/*    css: '&:not(.open) .button { bottom: 60px; } @media only screen and (max-width: 600px) { &:not(.open) .button { bottom: 100px; } }'*/}
      {/*  })`}*/}
      {/*</Script>*/}
    </>
  )
}

export default Layout
