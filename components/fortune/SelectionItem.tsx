import {FC, useEffect, useState} from "react";
import {AddressZero} from "@ethersproject/constants";
import Image from "next/image";

import {CryptoCurrencyIcon, Flex, FormatCryptoCurrency, Text} from "../primitives";
import {FORTUNE_CHAINS} from "../../utils/chains";
import {useAccount, useContractRead} from "wagmi";
import ERC721Abi from "../../artifact/ERC721Abi";
import ERC20Abi from "../../artifact/ERC20Abi";
import {useMarketplaceChain} from "../../hooks";

type dataItemProps = {
  data: Record<string, any>
  onApprove?: (approved: boolean) => void
}

const SelectionItem: FC<dataItemProps> = ({ data, onApprove }) => {
  const { address } = useAccount()
  const marketplaceChain = useMarketplaceChain()
  const fortuneChain = FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id);

  const { data: isApproved } = useContractRead({
    enabled: !!fortuneChain?.address && !!data.contract && !!address && data.type === 'erc721' && !!onApprove,
    abi: ERC721Abi,
    address: data.contract as `0x${string}`,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, fortuneChain?.address as `0x${string}`],
  })

  const { data: allowance } = useContractRead({
    enabled: !!fortuneChain?.address && !!data.contract && !!address && data.type === 'erc20' && !!onApprove,
    abi:  ERC20Abi,
    address: data.contract as `0x${string}`,
    functionName:  'allowance',
    args: [address as `0x${string}`, fortuneChain?.address as `0x${string}`],
  })

  useEffect(() => {
    if (data.type === 'erc721' && isApproved) {
      onApprove?.(true)
    }

    if (data.type === 'erc20' && (allowance || 0) >= data.value) {
      onApprove?.(true)
    }
  }, [isApproved, allowance])

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
            amount={data.values?.[0]}
            address={data.contract}
            textStyle="h5"
            logoHeight={15}
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
        >{`${data.name} x${data.tokenIds.length}`}</Text>
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