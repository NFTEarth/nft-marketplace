import { Anchor, Box, Button, Flex, Text } from 'components/primitives'
import { Avatar } from 'components/primitives/Avatar'
import * as RadixDialog from '@radix-ui/react-dialog'
import {
  faBars,
  faXmark,
  faRightFromBracket,
  faChevronDown,
  faBridge,
  faGift,
  faGear,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faXTwitter,
  faDiscord,
  faTelegram,
} from '@fortawesome/free-brands-svg-icons'
import Link from 'next/link'
import Image from 'next/legacy/image'
import { useAccount, useDisconnect } from 'wagmi'
import { ConnectWalletButton } from 'components/ConnectWalletButton'
import Jazzicon, { jsNumberForAddress } from 'react-jazzicon'
import { FullscreenModal } from 'components/common/FullscreenModal'
import { useENSResolver, useMarketplaceChain, useProfile } from 'hooks'
import Wallet from 'components/navbar/Wallet'
import { Collapsible } from '../primitives/Collapsible'
import { signOut } from 'next-auth/react'
import Badge from '../primitives/Badge'

const HamburgerMenu = () => {
  const { address, isConnected } = useAccount({
    onDisconnect: async () => {
      await signOut({ callbackUrl: '/' })
    },
  })
  const {
    avatar: ensAvatar,
    shortAddress,
    shortName: shortEnsName,
  } = useENSResolver(address)
  const { disconnect } = useDisconnect()
  const { routePrefix } = useMarketplaceChain()
  const { data: profile } = useProfile(address)

  const trigger = (
    <Button
      css={{ justifyContent: 'center', width: '44px', height: '44px' }}
      type="button"
      size="small"
      color="gray3"
    >
      <FontAwesomeIcon icon={faBars} width={16} height={16} />
    </Button>
  )

  return (
    <FullscreenModal trigger={trigger}>
      {' '}
      <Flex
        css={{
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        <Flex
          css={{
            py: '$4',
            px: '$4',
            width: '100%',
            borderBottom: '1px solid $gray4',
          }}
          align="center"
          justify="between"
        >
          <Link href="/">
            <Box css={{ width: 34, cursor: 'pointer' }}>
              <Image
                src="/nftearth-icon.svg"
                width={34}
                height={39}
                alt="NFTEarth"
              />
            </Box>
          </Link>
          <RadixDialog.Close>
            <Flex
              css={{
                justifyContent: 'center',
                width: '44px',
                height: '44px',
                alignItems: 'center',
                borderRadius: 8,
                backgroundColor: '$gray3',
                color: '$gray12',
                '&:hover': {
                  backgroundColor: '$gray4',
                },
              }}
            >
              <FontAwesomeIcon icon={faXmark} width={16} height={16} />
            </Flex>
          </RadixDialog.Close>
        </Flex>
        <Flex
          css={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            height: '100%',
            py: '$5',
            px: '$4',
          }}
        >
          {isConnected && (
            <Link href={`/portfolio/${address}`} legacyBehavior>
              <Flex
                css={{
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  pb: '$4',
                }}
              >
                <Flex css={{ alignItems: 'center' }}>
                  {ensAvatar ? (
                    <Avatar size="medium" src={ensAvatar} />
                  ) : (
                    <Jazzicon
                      diameter={36}
                      seed={jsNumberForAddress(address as string)}
                    />
                  )}
                  <Text style="subtitle1" css={{ ml: '$2' }}>
                    {shortEnsName ? shortEnsName : shortAddress}
                  </Text>
                </Flex>
              </Flex>
            </Link>
          )}
          <Link href={`/${routePrefix}/collection-rankings`} legacyBehavior>
            <Text
              style="subtitle1"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
              }}
            >
              Collections
            </Text>
          </Link>

          <Link href="/bridge" legacyBehavior>
            <Text
              style="subtitle1"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
              }}
            >
              NFTE Bridge
            </Text>
          </Link>

          <Collapsible
            trigger={
              <Flex
                justify="between"
                css={{
                  width: '100%',
                  borderBottom: '1px solid $gray4',
                  cursor: 'pointer',
                  pb: '$4',
                  pt: '24px',
                }}
              >
                <Text style="subtitle1">More</Text>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  width={20}
                  height={20}
                  style={{
                    marginLeft: 10, // Add some space between the text and the icon
                  }}
                />
              </Flex>
            }
          >
            <Flex
              direction="column"
              css={{
                backgroundColor: '$gray2',
                px: '$4',
              }}
            >
          <Link href={`https://app.aragon.org/#/daos/polygon/0xc44c2e2714a4a9fb171ecc2ec7a472b692d66ac6/dashboard`} legacyBehavior>
            <Text
              style="subtitle1"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
              }}
            >
              DAO Governance
            </Text>
          </Link>
              <Link href={`https://nftearth.exchange/inscriptions`} legacyBehavior>
            <Text
              style="subtitle1"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
              }}
            >
              Inscriptions
            </Text>
          </Link>
          <Link href={`https://nftearth.exchange/raffle`} legacyBehavior>
            <Text
              style="subtitle1"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
              }}
            >
              Raffle
            </Text>
          </Link>
              <Link href="/fortune" legacyBehavior>
                <Text
                  style="subtitle1"
                  css={{
                    borderBottom: '1px solid $gray4',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  Fortune
                </Text>
              </Link>
              <Link
                href="https://smartnft.nftearth.exchange"
                target="_blank"
                legacyBehavior
              >
                <Text
                  style="subtitle1"
                  css={{
                    borderBottom: '1px solid $gray4',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  SmartNFT
                </Text>
              </Link>
            </Flex>
          </Collapsible>
          <Link href="/portfolio" legacyBehavior>
            <Flex
              direction="column"
              css={{
                borderBottom: '1px solid $gray4',
                cursor: 'pointer',
                pb: '$4',
                pt: '24px',
                gap: '$1',
              }}
            >
              <Text style="subtitle1">Portfolio</Text>
              <Text style="body3" color="subtle">
                Manage your digital assets
              </Text>
            </Flex>
          </Link>
          {isConnected ? (
            <>
              <Link href="/portfolio/settings" legacyBehavior>
                <Text
                  style="subtitle1"
                  css={{
                    borderBottom: '1px solid $primary9',
                    cursor: 'pointer',
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  <FontAwesomeIcon
                    icon={faGear}
                    width={16}
                    height={16}
                    style={{
                      marginRight: 10,
                      display: 'inline-block',
                      color: '#75F5A5',
                    }}
                  />
                  {`Settings`}
                </Text>
              </Link>
              <Wallet exp={profile?.exp} />
              <Flex
                css={{
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  alignItems: 'center',
                  borderBottom: '1px solid $gray4',
                }}
                onClick={() => disconnect()}
              >
                <Text
                  style="subtitle1"
                  css={{
                    pb: '$4',
                    pt: '24px',
                  }}
                >
                  Logout
                </Text>
                <Box css={{ color: '$gray10' }}>
                  <FontAwesomeIcon
                    icon={faRightFromBracket}
                    width={16}
                    height={16}
                  />
                </Box>
              </Flex>
            </>
          ) : (
            <Box>
              <ConnectWalletButton />
            </Box>
          )}
        </Flex>
        <Flex
          css={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            pt: '24px',
            pb: '$5',
            px: '$4',
            gap: '$4',
            width: '100%',
            borderTop: '1px solid #75F5A5',
          }}
        >
          <a href="https://x.com/NFTEarth_L2" target="_blank">
            <Button
              css={{ justifyContent: 'center', width: '44px', height: '44px' }}
              type="button"
              size="small"
              color="gray3"
            >
              <FontAwesomeIcon icon={faXTwitter} width={20} height={20} />
            </Button>
          </a>
          <a href="https://discord.gg/56a7u3wDkX" target="_blank">
            <Button
              css={{ justifyContent: 'center', width: '44px', height: '44px' }}
              type="button"
              size="small"
              color="gray3"
            >
              <FontAwesomeIcon icon={faDiscord} width={20} height={20} />
            </Button>
          </a>
        </Flex>
      </Flex>
    </FullscreenModal>
  )
}

export default HamburgerMenu
