import {Box, Flex, FormatCryptoCurrency, Text} from "../primitives";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleDollarToSlot} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";

import {formatDollar} from "../../utils/numbers";

type GrandPrizeProps = {
  prizes: any
  tokens: any
}

const GrandPrize = ({prizes, tokens} : GrandPrizeProps) => {
  const prize = prizes.find((p: any) => p.prizeTier == 0)
  const token = tokens.find((t: any) => t.token.contract === prize.prizeAddress.toLowerCase() && t.token.tokenId === parseInt(prize.prizeId.hex).toString())

  return (
    <Box css={{ backgroundColor: 'orange', borderRadius: 20, p: 2, height: 'fit-content' }}>
      <Flex direction="row" align="center" css={{ px: 20, py: 10 }} justify="between">
        <Text style="h4">Grand Prize</Text>
        <FontAwesomeIcon
          size="2x"
          icon={faCircleDollarToSlot}
        />
      </Flex>
      <Box css={{ borderRadius: 20, backgroundColor: '#222', padding: 12 }}>
        <Box css={{ borderRadius: 15, overflow: 'hidden' }}>
          <Image
            src={token?.token?.imageSmall || '/SmolBrainsV2.png'}
            alt="Grand Prize"
            width={312}
            height={312}
            style={{
              backgroundColor: '#fff'
            }}/>
        </Box>
        <Flex direction="column" css={{ mt: '$2', gap: 5 }}>
          <Flex justify="between" css={{ flex: 1 }}>
            <Text style="body2">{token?.token?.name || `#${token?.token?.tokenId || '-'}`}</Text>
            <FormatCryptoCurrency
              amount={(token?.market?.floorAsk?.price || token?.token?.lastSale?.price)?.amount?.decimal}
              address={(token?.market?.floorAsk?.price || token?.token?.lastSale?.price)?.currency?.contract}
              decimals={(token?.market?.floorAsk?.price || token?.token?.lastSale?.price)?.currency?.decimals}
              logoHeight={16}
              maximumFractionDigits={2}
              textStyle="body2"
            />
          </Flex>
          <Flex justify="between" css={{ flex: 1 }}>
            <Text style="body2" css={{ fontWeight: 'bold' }}>{token?.token?.collection?.name || `${token?.token?.name || '-'}`}</Text>
            {(token?.market?.floorAsk?.price || token?.token?.lastSale?.price)?.amount?.usd && (
              <Text style="body2" css={{ color: 'green' }} ellipsify>
                {`(${formatDollar((token?.market?.floorAsk?.price || token?.token?.lastSale?.price)?.amount?.usd)})`}
              </Text>
            )}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default GrandPrize;