import { FC, ReactNode } from 'react'
import WidgetBot from '@widgetbot/react-embed'
import { Box } from 'components/primitives'
import Navbar from './navbar'
import {useMounted} from 'hooks'

type Props = {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  const isMounted = useMounted()

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
      {/*{isMounted && (*/}
      {/*  <WidgetBot*/}
      {/*    server="1062256160264171520"*/}
      {/*    channel="1062472338987286598"*/}
      {/*    notifications*/}

      {/*  />*/}
      {/*)}*/}
    </>
  )
}

export default Layout
