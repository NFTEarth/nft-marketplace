import {FC, useState} from "react";
import * as CollapsiblePrimitive from "@radix-ui/react-collapsible";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faChevronDown, faExternalLink} from "@fortawesome/free-solid-svg-icons";
import Link from "next/link";
import {Chain} from "wagmi/chains";

import {Box, Flex, Text} from "../primitives";
import {CollapsibleContent, CollapsibleRoot, slideDown, slideUp} from "../primitives/Collapsible";
import {truncateAddress} from "../../utils/truncate";

type Props = {
  addresses: Record<string, string>,
  chain: Chain
}

const AddressCollapsible: FC<Props> = ({ addresses, chain }) => {
  const [collapsibleOpen, setCollapsibleOpen] = useState(false)

  return (
    <CollapsibleRoot
      onOpenChange={(open) => {
        setCollapsibleOpen(open)
      }}
      open={collapsibleOpen}
      css={{
        backgroundColor: '$gray11',
        marginTop: 20,
      }}
    >
      <CollapsiblePrimitive.Trigger asChild>
        <Flex
          justify="between"
          css={{
            px: '$4',
            py: '$3',
            cursor: 'pointer',
            userSelect: 'none',
            '@md': {
              width: 400
            }
          }}
        >
          <Flex align="center" css={{ gap: '$3' }}>
            <Text
              style="subtitle1"
              css={{
                color: '$gray1'
              }}
            >
              Contract Addresses
            </Text>
          </Flex>
          <Box
            css={{
              color: '$gray1',
              transform: collapsibleOpen ? 'rotate(180deg)' : 'rotate(0)',
              transition: '.3s',
            }}
          >
            <FontAwesomeIcon icon={faChevronDown} width={16} height={16} />
          </Box>
        </Flex>
      </CollapsiblePrimitive.Trigger>
      <CollapsibleContent
        css={{
          '&[data-state="open"]': {
            animation: `${slideDown} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
          },
          '&[data-state="closed"]': {
            animation: `${slideUp} 300ms cubic-bezier(0.87, 0, 0.13, 1)`,
          },
        }}
      >
        <Flex
          direction="column"
          css={{
            '> div:nth-child(odd)': {
              background: '$gray3',
            },
            '> div:nth-child(even)': {
              background: '$gray5',
            }
          }}
        >
          {Object.keys(addresses).map((k, i)=> (
            <Flex
              key={`address-${i}`}
              justify="between"
              css={{
                px: 15,
                py: 10
              }}
            >
              <Text>{k}</Text>
              <Box
                as={Link}
                href={`${chain.blockExplorers?.default.url}/address/${addresses[k]}`}
                target="_blank"
                css={{
                  '&:hover': {
                    color: '$primary11',
                  }
                }}
              >
                {truncateAddress(addresses[k])}
                <FontAwesomeIcon
                  icon={faExternalLink}
                  width={15}
                  height={15}
                  style={{
                    marginLeft: 10,
                    display: 'inline-block'
                  }}
                />
              </Box>
            </Flex>
          ))}
        </Flex>
      </CollapsibleContent>
    </CollapsibleRoot>
  )
}

export default AddressCollapsible