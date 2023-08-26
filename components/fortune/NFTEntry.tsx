import {FC, useEffect, useState} from "react";
import {setParams} from "@reservoir0x/reservoir-sdk";
import {useMarketplaceChain} from "../../hooks";
import {TokenMedia, useUserTokens} from "@reservoir0x/reservoir-kit-ui";
import {Flex} from "../primitives";
import {parseEther} from "viem";

export type ReservoirFloorPrice = {
  id: `0x${string}`
  payload: `0x${string}`
  timestamp: number
  signature: `0x${string}`
}

type ReservoirOracleFloorPriceResponse = {
  price: number
  message: ReservoirFloorPrice
}

export type SelectionData = {
  type?: string,
  image?: string,
  name?: string,
  tokenId?: string,
  contract?: string,
  value?: bigint,
  reservoirOracleFloor?: ReservoirFloorPrice
}

type NFTEntryProps = {
  data: ReturnType<typeof useUserTokens>['data'][0],
  selected: boolean
  handleClick?: (key: string, data: SelectionData) => void
}

const NFTEntry : FC<NFTEntryProps> = ({ data, handleClick, selected }) => {
  const marketplaceChain = useMarketplaceChain()
  const [price, setPrice]= useState(BigInt(0))
  const [reservoirOracleFloor, setReservoirOracleFloor] = useState<ReservoirFloorPrice>()
  const contract = data?.token?.contract

  useEffect(() => {
    const path = new URL(`${marketplaceChain.proxyApi}/oracle/collections/floor-ask/v6`, window.location.origin);

    setParams(path, {
      kind: 'twap',
      collection: contract
    })

    fetch(path.href)
      .then(res => res.json())
      .then(res => {
        setPrice(BigInt(parseEther(res.price.toString())))
        setReservoirOracleFloor({
          id: res.message.id,
          payload: res.message.payload,
          timestamp: res.message.timestamp,
          signature: res.message.signature
        })
      }).catch((e) => {
        console.error(e);
      })
  },  [contract, marketplaceChain])

  return (
    <Flex
      onClick={reservoirOracleFloor ? () => {
        const key = `${data?.token?.contract}:${data?.token?.tokenId}`
        handleClick?.(
          key,
          {
            type: data?.token?.kind,
            image: data?.token?.imageSmall,
            name: data?.token?.collection?.name,
            tokenId: data?.token?.tokenId as string,
            contract: data?.token?.contract,
            value: BigInt(data?.token?.collection?.floorAskPrice?.amount?.decimal || 0),
            reservoirOracleFloor,
          }
        )
      } : () => {}}
      css={{
        cursor: reservoirOracleFloor ? 'pointer' : 'default'
      }}
    >
      <TokenMedia
        token={{
          image: data?.token?.imageSmall,
          tokenId: data?.token?.tokenId as string
        }}
        style={{
          width: '100%',
          height: 'auto',
          transition: 'filter .3s ease-in-out',
          borderRadius: '$base',
          aspectRatio: '1/1',
          border: selected ? '2px solid hsl(142, 34%, 51%)' : '2px solid #5D770D',
          filter: reservoirOracleFloor ? 'unset' : 'grayscale(1)'
        }}
      />
    </Flex>
  )
}

export default NFTEntry;