import {Box, Flex, FormatCryptoCurrency, Grid, Text} from "../primitives";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleDollarToSlot} from "@fortawesome/free-solid-svg-icons";
import Image from "next/image";
import {formatDollar} from "../../utils/numbers";
import {useMemo, useEffect, useState} from "react";
import {BigNumber} from "@ethersproject/bignumber";

type NFTPrizeProps = {
  prizes: any
  tokens: any
}

const NFTPrizes = ({prizes, tokens} : NFTPrizeProps) => {
  const nftPrizes = useMemo<any>(() => prizes
    .filter((p: any) => (p.prizeTier == 1 && p.prizeType == 0)).
    sort((p: any) => p.prizeAddress), [prizes])
  const [NFTPrizeCollections, setNFTPrizeCollections] = useState<Record<string, any>>({})
  const [totalPrizeEth, setTotalPrizeEth] = useState<number>(0)

  useEffect(() => {
    const nftPrizeCollections: Record<string, any> = {};
    let totalEth = 0

    for(let i = 0; i < nftPrizes.length; i++) {
      if (!nftPrizeCollections[nftPrizes[i].prizeAddress]) {
        nftPrizeCollections[nftPrizes[i].prizeAddress] = [];
      }

      nftPrizes[i].token = tokens.find((t: any) => t.token.contract === nftPrizes[i].prizeAddress.toLowerCase() && t.token.tokenId === parseInt(nftPrizes[i].prizeId.hex).toString())
      totalEth += parseFloat((nftPrizes[i]?.token?.market?.floorAsk?.price || nftPrizes[i]?.token?.token?.lastSale?.price)?.amount.native || 0)
      nftPrizeCollections[nftPrizes[i].prizeAddress].push(nftPrizes[i]);
    }

    setTotalPrizeEth(totalEth);
    setNFTPrizeCollections(nftPrizeCollections);
  }, [nftPrizes])

  return (
    <Box css={{ backgroundColor: '$primary11', borderRadius: 20, flex: 1, p: 2 }}>
      <Flex direction="row" align="center" css={{ px: 20, py: 10 }} justify="between">
        <Text style="h4">{`(${nftPrizes.length}) More NFTs You Can Win!`}</Text>
        {totalPrizeEth > 0 && (
          <FormatCryptoCurrency
            amount={totalPrizeEth}
            address={'0x0000000000000000000000000000000000000000'}
            decimals={16}
            logoHeight={16}
            maximumFractionDigits={2}
            textStyle="h5"
          />
        )}
      </Flex>
      <Flex css={{ borderRadius: 20, backgroundColor: '#222', padding: 12, gap: 20, flexDirection: 'column' }}>
        {Object.keys(NFTPrizeCollections).map((collection) => {
          const prizes = NFTPrizeCollections[collection] || [];

          return (
            <Flex key={`nft-prize-collection-${prizes[0].prizeAddress}`} css={{ flexDirection: 'column', gap: 10 }}>
              <Text style="body1" css={{ fontWeight: 'bold' }}>{prizes[0]?.token?.token?.collection?.name}</Text>
              <Grid align="center" justify="start" css={{
                gap: 20,
                flexWrap: 'wrap',
                gridTemplateColumns: 'repeat(2, 1fr)',
                '@bp800': {
                  gridTemplateColumns: 'repeat(4, 1fr)',
                }
              }}>
                {prizes.map((prize: any, i: number) => {

                  return (
                    <Box key={`nft-prize-${prize.prizeAddress}-${i}`}>
                      <Box css={{ borderRadius: 15, overflow: 'hidden' }}>
                        <Image
                          src={prize?.token?.token?.imageSmall || '/earthlings-4444.png'}
                          alt="NFT Reward"
                          width={182}
                          height={182}
                          style={{
                            backgroundColor: '#fff',
                            maxWidth: '100%'
                          }}/>
                      </Box>
                      <Flex direction="column" css={{ mt: '$2', gap: 5 }}>
                        <Flex justify="between" css={{ flex: 1 }}>
                          <Text style="body2">{`#${prize?.token?.token?.tokenId}`}</Text>
                          {(prize?.token?.market?.floorAsk?.price || prize?.token?.token?.lastSale?.price)?.amount?.usd && (
                            <Text style="body2" css={{ color: 'green' }} ellipsify>
                              {`(${formatDollar((prize?.token?.market?.floorAsk?.price || prize?.token?.token?.lastSale?.price)?.amount?.usd)})`}
                            </Text>
                          )}
                        </Flex>
                      </Flex>
                    </Box>
                  )
                })}
              </Grid>
            </Flex>
          )
        })}
      </Flex>
    </Box>
  )
}

export default NFTPrizes;