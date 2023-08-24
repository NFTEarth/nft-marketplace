import {FC} from "react";
import {AddressZero} from "@ethersproject/constants";
import Image from "next/image";

import {Box, CryptoCurrencyIcon, Flex, FormatCryptoCurrency, Text} from "../primitives";

export type SelectionItemType = {
  
}

type dataItemProps = {
  data: Record<string, any>
}

const SelectionItem: FC<dataItemProps> = ({ data }) => {
  if (data.type === 'erc20') {
    return (
      <Flex
        justify="start"
        css={{
          gap: 10,
          p: '$2',
          backgroundColor: '$gray5',
          borderRadius: 6,
        }}
      >
        <Flex
          align="center"
          justify="center"
          css={{
            position: 'relative',
            width: 40,
            height: 40,
            borderRadius: 6,
            backgroundImage: 'linear-gradient(180deg, $primary9 0%, $primary8 100%)',
            overflow: 'hidden'
          }}
        >
          <CryptoCurrencyIcon
            address={data.contract}
            chainId={data.chainId}
            css={{
              height: 30
            }}
          />
        </Flex>
        <Flex
          justify="between"
          css={{
            gap: 20,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            width: 'calc(100% - 40px)'
          }}
        >
          <Text
            style="subtitle3"
            css={{
              whiteSpace: 'nowrap'
            }}
          >{data.name}</Text>
          <FormatCryptoCurrency
            amount={data.value}
            address={data.contract}
            decimals={18}
            textStyle="h4"
            logoHeight={20}
          />
        </Flex>
      </Flex>
    )
  }
  
  return (
    <Flex
      justify="start"
      css={{
        gap: 10,
        p: '$2',
        backgroundColor: '$gray5',
        borderRadius: 6,
      }}
    >
      <Flex
        css={{
          position: 'relative',
          width: 60,
          height: 60,
        }}
      >
        <Image
          fill
          src={data.image}
          alt={data.name}
          style={{
            width: '100%',
            objectFit: 'cover',
            borderRadius: '$base',
            aspectRatio: '1/1',
          }}
        />
      </Flex>
      <Flex
        direction="column"
        css={{
          gap: 20,
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          width: 'calc(100% - 70px)'
        }}
      >
        <Text
          style="subtitle3"
          css={{
            whiteSpace: 'nowrap'
          }}
        >{`${data.name} #${data.tokenId}`}</Text>
        <FormatCryptoCurrency
          amount={data.value}
          address={AddressZero}
          decimals={18}
          textStyle="subtitle3"
          logoHeight={14}
        />
      </Flex>
    </Flex>
  )
};

export default SelectionItem;