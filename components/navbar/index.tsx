import { useRef } from 'react'
import { Box, Flex } from '../primitives'
import GlobalSearch from './GlobalSearch'
import { useRouter } from 'next/router'
import { useHotkeys } from 'react-hotkeys-hook'
import Link from 'next/link'
import Image from "next/legacy/image"
import { ConnectWalletButton } from 'components/ConnectWalletButton'
import NavItem from './NavItem'
import HamburgerMenu from './HamburgerMenu'
import MobileSearch from './MobileSearch'
import { useMediaQuery } from 'react-responsive'
import { useMarketplaceChain, useMounted } from '../../hooks'
import { useAccount } from 'wagmi'
import CartButton from './CartButton'
import { AccountSidebar } from 'components/navbar/AccountSidebar'
import { Dropdown, DropdownMenuItem } from 'components/primitives/Dropdown'
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faChartBar,
  faChevronDown,
  faGift,
  faArrowsLeftRight,
  faBridge
} from "@fortawesome/free-solid-svg-icons";

export const NAVBAR_HEIGHT = 81
export const NAVBAR_HEIGHT_MOBILE = 77

const Navbar = () => {
  const { isConnected } = useAccount()
  const isMobile = useMediaQuery({ query: '(max-width: 960px)' })
  const isMounted = useMounted()
  const { routePrefix } = useMarketplaceChain()

  let searchRef = useRef<HTMLInputElement>(null)

  const router = useRouter()
  useHotkeys('meta+k', () => {
    if (searchRef?.current) {
      searchRef?.current?.focus()
    }
  })

  if (!isMounted) {
    return null
  }

  return isMobile ? (
    <Flex
      css={{
        height: NAVBAR_HEIGHT_MOBILE,
        px: '$4',
        width: '100%',
        borderBottom: '1px solid $gray4',
        zIndex: 999,
        background: '$slate1',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
      align="center"
      justify="between"
    >
      <Box css={{ flex: 1 }}>
        <Flex align="center">
          <Link href={`/${routePrefix}`}>
            <Box css={{ width: 34, cursor: 'pointer' }}>
              <Image
                src="/nftearth-icon.svg"
                width={39}
                height={39}
                alt="NFTEarth"
              />
            </Box>
          </Link>
        </Flex>
      </Box>
      <Flex align="center" css={{ gap: '$3' }}>
        <MobileSearch key={`${router.asPath}-search`} />
        <CartButton />
        <HamburgerMenu key={`${router.asPath}-hamburger`} />
      </Flex>
    </Flex>
  ) : (
    <Flex
      css={{
        height: NAVBAR_HEIGHT,
        px: '$5',
        width: '100%',
        maxWidth: 1920,
        mx: 'auto',
        borderBottom: '1px solid $gray4',
        zIndex: 999,
        background: '$neutralBg',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
      }}
      align="center"
      justify="between"
    >
      <Flex align="center" justify="between" css={{ flex: 1 }}>
        <Flex align="center" css={{ flex: 1 }}>
          <Link href={`/${routePrefix}`}>
            <Box css={{ width: 112, cursor: 'pointer' }}>
              <Image
                src="/nftearth-icon.svg"
                width={50}
                height={50}
                alt="NFTEarth"
              />
            </Box>
          </Link>
          <Flex css={{ flex: 1, px: '$5', maxWidth: 600 }}>
            <GlobalSearch
              ref={searchRef}
              placeholder="Search NFTs..."
              containerCss={{ width: '100%' }}
              key={router.asPath}
            />
          </Flex>
        </Flex>
        <Flex align="center" css={{ gap: '$5', mr: '$5' }}>
          <Link href={`/${routePrefix}/collection-rankings`}>
            <NavItem active={router.pathname.includes('collection-rankings')}>
              Collections
            </NavItem>
          </Link>
          <Dropdown
            modal={false}
            trigger={
              <NavItem>
                {`Token`}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  width={16}
                  height={16}
                  style={{
                    marginLeft: 5,
                    display: 'inline-block'
                  }}
                />
              </NavItem>
            }
            contentProps={{
              asChild: true,
              forceMount: true,
              sideOffset: 35
            }}
          >
            <DropdownMenuItem
              as={Link}
              href="/bridge"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faBridge} width={20} height={20}/>
              Bridge
            </DropdownMenuItem>
            <DropdownMenuItem
              as={Link}
              href="https://app.uniswap.org/swap?outputCurrency=0x51b902f19a56f0c8e409a34a215ad2673edf3284&chain=arbitrum"
              target="_blank"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faArrowsLeftRight} width={20} height={20}/>
              Swap NFTE
            </DropdownMenuItem>
            <DropdownMenuItem
              as={Link}
              href="https://merkl.angle.money"
              target="_blank"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faGift} width={20} height={20}/>
              LP Rewards
            </DropdownMenuItem>
            <DropdownMenuItem
              as={Link}
              href="https://staking.nftearth.exchange"
              target="_blank"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faChartBar} width={20} height={20}/>
              {`Staking Rewards`}
            </DropdownMenuItem>
          </Dropdown>
          <Dropdown
            modal={false}
            trigger={
              <NavItem>
                {`Products`}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  width={16}
                  height={16}
                  style={{
                    marginLeft: 5,
                    display: 'inline-block'
                  }}
                />
              </NavItem>
            }
            contentProps={{
              asChild: true,
              forceMount: true,
              sideOffset: 35
            }}
          >
            <DropdownMenuItem
              as={Link}
              href="/fortune"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <Image src="/images/fortune.png" width={20} height={20} objectFit="contain" alt="Fortune"/>
              {`Fortune`}
            </DropdownMenuItem>
            <DropdownMenuItem
              as={Link}
              href="https://smartnft.nftearth.exchange"
              target="_blank"
              css={{
                display: 'flex',
                py: '$3',
                width: '100%',
                alignItems: 'center',
                gap: 10
              }}
            >
              <Image src="/images/smartnft.png" width={20} height={20} objectFit="contain" alt="SmartNFT"/>
              {`SmartNFT`}
            </DropdownMenuItem>
          </Dropdown>
        </Flex>
      </Flex>

      <Flex css={{ gap: '$3' }} justify="end" align="center">
        <CartButton />
        {isConnected ? (
          <AccountSidebar />
        ) : (
          <Box css={{ maxWidth: '185px' }}>
            <ConnectWalletButton />
          </Box>
        )}
      </Flex>
    </Flex>
  )
}

export default Navbar
