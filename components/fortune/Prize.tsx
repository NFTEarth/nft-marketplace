import {Box, Flex, FormatCryptoCurrency} from "../primitives";
import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";

export type PrizeType = {
  type: 'erc721' | 'erc1155' | 'erc20',
  bidderName: string,
  address: `0x${string}`
  price: bigint
  amount?: bigint
  tokenId?: bigint
}

const YoloPrize = ({ data } : { data: PrizeType }) => {
  return (
    <Flex
      title={data.bidderName}
      direction="column"
      css={{
        overflow: 'hidden',
        borderRadius: 6,
        border: '1px solid $gray8',
        position: 'relative'
      }}
    >
      <Flex
        align="center"
        justify="center"
        css={{
          width: 96,
          height: 96,
          backgroundImage: 'linear-gradient(180deg, $primary9 0%, $primary8 100%)'
        }}
      >
        {data.type === 'erc20' && (
          <CryptoCurrencyIcon
            address={data.address}
            css={{ height: 50 }}
          />
        )}
      </Flex>
      <Flex css={{ p: '$2'}}>
        <FormatCryptoCurrency amount={data.price} />
      </Flex>
    </Flex>
  )
}

export default YoloPrize;