import {FC, SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {useUserTokens} from '@reservoir0x/reservoir-kit-ui'
import {faClose, faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {AddressZero} from "@ethersproject/constants";
import {parseUnits} from "ethers";
import {useIntersectionObserver} from "usehooks-ts";
import {
  useAccount,
  useBalance,
} from "wagmi";
import {
  formatEther,
  parseEther
} from "viem";
import {useMediaQuery} from "react-responsive";

import NumericalInput from "../bridge/NumericalInput";
import {Button, CryptoCurrencyIcon, Flex, FormatCryptoCurrency, Text} from "../primitives";
import {useFortune, useMarketplaceChain, useMounted} from "hooks";
import SelectionItem from "./SelectionItem";
import NFTEntry, {SelectionData} from "./NFTEntry";
import FortuneDepositModal from "./DepositModal";
import {Round} from "../../hooks/useFortuneRound";

type EntryProps = {
  roundId: number,
  show: boolean
  onClose: () => void
}

type FortuneData = {
  round: Round,
  selections: Record<string, SelectionData>,
  valueEth: string
}


const FortuneEntryForm: FC<EntryProps> = ({ roundId, show, onClose }) => {
  const { address } = useAccount()
  const [showTokenEntry, setShowTokenEntry] = useState(false)
  const [valueNFTE, setValueNFTE] = useState<string>('')
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const loadMoreObserver = useIntersectionObserver(loadMoreRef, {})
  const {
    data: tokens,
    fetchNextPage,
    mutate,
    isFetchingPage,
    isValidating,
  } = useUserTokens(address, {
    limit: 20,
    sortBy: 'lastAppraisalValue',
  }, {
    revalidateOnFocus: true,
    revalidateIfStale: false,
    revalidateOnMount: true
  })

  const isMounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 }) && isMounted
  const marketplaceChain = useMarketplaceChain()
  const ethBalance = useBalance({
    address,
    chainId: marketplaceChain.id
  })
  const { data: { round, valueEth, selections }, setSelections, setValueEth } = useFortune<FortuneData>(q => q)
  const minimumEntry = BigInt(round?.valuePerEntry || 0)
  const filteredTokens = tokens.filter(t => t.token?.kind === 'erc721' && BigInt(t.token?.collection?.floorAskPrice?.amount?.raw || '0') > minimumEntry)

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting])

  const handleSetEthValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueEth?.(val);
    } catch (e) {
      setValueEth?.('0');
    }
  }

  const handleSetNFTEValue = (val: string) => {
    try {
      parseUnits(val, 18);
      setValueNFTE(val);
    } catch (e) {
      setValueNFTE('0');
    }
  }

  const handleAddEth = async (e: any) => {
    e.preventDefault();
    const value = BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString())

    if (value < minimumEntry) {
      return;
    }

    if ((ethBalance.data?.value || 0) < value) {
      return;
    }
  }

  const handleAddNFTE = (e: any) => {
    e.preventDefault();

    setSelections?.({
      ...selections,
      [`0x51B902f19a56F0c8E409a34a215AD2673EDF3284`]: {
        type: 'erc20',
        name: 'NFTE',
        contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        values: [BigInt(parseEther(`${valueNFTE === '' ? 0 : +valueNFTE}`).toString())],
        approved: false,
      }
    })

    setValueNFTE('')
  }

  if (!show) {
    return null;
  }

  return (
    <>
      <Flex
        direction="column"
        css={{
          gridArea: 'main',
          overflow: 'hidden',
          borderRadius: 12,
          backgroundColor: '$gray3',
        }}
      >
        <Flex
          justify="between"
          align="center"
          css={{
            backgroundColor: '$gray6',
            p: 16
          }}
        >
          {(isMobile && showTokenEntry) && (
            <Button size="xs" color="ghost" onClick={() => {
              setShowTokenEntry(false)
            }}>
              <FontAwesomeIcon icon={faArrowLeft} width={16} height={16} />
            </Button>
          )}
          <Text style="h5">Select Entries</Text>
          <Button size="xs" color="primary" onClick={onClose}>
            <FontAwesomeIcon icon={faClose} width={16} height={16} />
          </Button>
        </Flex>
        <Flex
          css={{
            p: 16,
            display: 'grid',
            gridTemplateColumns: '1fr',
            '@md': {
              gridTemplateAreas: '"left right right" "left right right" "left right right" "left right right"',
              gridTemplateColumns: 'repeat(3, 1fr)',
              height: '100%',
              p: 0,
            }
          }}
        >
          {!showTokenEntry && (
            <Flex
              direction="column"
              css={{
                gridArea: 'left',
                borderRight: '1px solid',
                borderRightColor: '$gray5',
                p: 16,
                gap: 20
              }}
            >
              <Flex direction="column" css={{ gap: 10}}>
                <Text style="subtitle3">Tokens</Text>
                <Flex
                  align="center"
                  css={{
                    backgroundColor: 'rgba(0,0,0,0.2)',
                    gap: 10,
                    p: 12,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onClick={() => {
                    if (isMobile) {
                      setShowTokenEntry(true)
                    }
                  }}
                >
                  <CryptoCurrencyIcon address={AddressZero} chainId={marketplaceChain.id} css={{ height: 15 }} />
                  <Text style="h6" css={{ color: '$primary13' }}>ETH/NFTE</Text>
                </Flex>
              </Flex>
              <Flex direction="column" css={{ gap: 10}}>
                <Text style="subtitle3">NFTs</Text>
                <Flex
                  css={{
                    gap: 10,
                    flexWrap: 'wrap',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(2, 1fr)',
                    '@md': {
                      gridTemplateColumns: 'repeat(3, 1fr)',
                    },
                    overflowY: 'auto'
                  }}>
                  {filteredTokens.map((token, i: number) => (
                    <NFTEntry
                      key={`entry-token-${i}`}
                      data={token}
                      selected={!!selections[`${token?.token?.contract}`]}
                      handleClick={( data) => {
                        const existing = selections[`${data.contract}`]
                        if (existing) {
                          const newSelections = {...selections};
                          if (existing.tokenIds?.includes(BigInt(`${data.tokenId}`))) {
                            existing.tokenIds = existing.tokenIds.filter(a => a !== BigInt(`${data.tokenId}`))
                          } else {
                            existing.tokenIds?.push(BigInt(`${data.tokenId}`))
                          }
                          newSelections[`${data.contract}`] = existing;

                          if (!existing.tokenIds?.length) {
                            delete newSelections[`${data.contract}`]
                          }

                          setSelections?.(newSelections)
                        } else {
                          setSelections?.({
                            ...selections,
                            [`${data.contract}`]: {
                              type: 'erc721',
                              contract: data.contract,
                              approved: data.approved,
                              name: data.name,
                              image: data.image,
                              tokenIds: [BigInt(`${data.tokenId}`)],
                              values: [BigInt(`${data.value}`)],
                              reservoirOracleFloor: data.reservoirOracleFloor
                            }
                          })
                        }
                      }}
                    />
                  ))}
                  <Flex ref={loadMoreRef}/>
                </Flex>
              </Flex>
            </Flex>
          )}
          {(!isMobile || showTokenEntry) && (
            <Flex
              direction="column"
              css={{
                gridArea: 'right',
                borderRight: '1px solid',
                borderRightColor: '$gray5',
                p: 16
              }}
            >
              <Text style="h5" css={{ mb: 30 }}>Add ETH or NFTE</Text>
              <Flex
                direction="column"
                css={{
                  gap: 10,
                  borderBottom: '1px solid',
                  borderBottomColor: '$gray5',
                  p: 16
                }}
              >
                <Flex justify="between">
                  <Text style="h6">Add ETH</Text>
                  <Text style="subtitle3">{`Minimum Entry is ${formatEther(minimumEntry)}Ξ`}</Text>
                </Flex>
                <NumericalInput
                  value={valueEth}
                  onUserInput={handleSetEthValue}
                  iconStyles={{
                    top: 4,
                    right: 4,
                    left: 'auto'
                  }}
                  containerCss={{
                    width: '100%'
                  }}
                  css={{
                    px: 20,
                    boxShadow: 'inset 0 0 0 2px $$focusColor',
                    textAlign: 'right',
                    '&:hover': {
                      backgroundColor: '$gray4'
                    }
                  }}
                />
                <Flex
                  align="center"
                  justify="between"
                >

                  <Text>ETH in wallet:</Text>
                  <Flex align="center" css={{ gap: 10 }}>
                    {/*<Text style="body3">{`(${valueEth})`}</Text>*/}
                    <FormatCryptoCurrency
                      amount={ethBalance.data?.value}
                      decimals={ethBalance.data?.decimals}
                      textStyle="subtitle2"
                      logoHeight={16}
                    />
                  </Flex>
                </Flex>
              </Flex>
              {/*<Flex*/}
              {/*  direction="column"*/}
              {/*  css={{*/}
              {/*    gap: 10,*/}
              {/*    borderBottom: '1px solid',*/}
              {/*    borderBottomColor: '$gray5',*/}
              {/*    p: 16*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <Text style="h6">Add NFTE OFT</Text>*/}
              {/*  <NumericalInput*/}
              {/*    value={valueNFTE}*/}
              {/*    onUserInput={handleSetNFTEValue}*/}
              {/*    icon={<Button size="xs" color="primary" onClick={handleAddNFTE}>Add</Button>}*/}
              {/*    iconStyles={{*/}
              {/*      top: 4,*/}
              {/*      right: 4,*/}
              {/*      left: 'auto'*/}
              {/*    }}*/}
              {/*    containerCss={{*/}
              {/*      width: '100%'*/}
              {/*    }}*/}
              {/*    css={{*/}
              {/*      pl: 20,*/}
              {/*      pr: 70,*/}
              {/*      boxShadow: 'inset 0 0 0 2px $$focusColor',*/}
              {/*      textAlign: 'right',*/}
              {/*      '&:hover': {*/}
              {/*        backgroundColor: '$gray4'*/}
              {/*      }*/}
              {/*    }}*/}
              {/*  />*/}
              {/*  <Flex*/}
              {/*    align="center"*/}
              {/*    justify="between"*/}
              {/*  >*/}
              {/*    <Text>NFTE OFT in wallet:</Text>*/}
              {/*    <Flex align="center" css={{ gap: 10 }}>*/}
              {/*      <Text style="body3">{`($1,615.9)`}</Text>*/}
              {/*      <Text style="subtitle2">{`${valueNFTE} NFTE`}</Text>*/}
              {/*      <CryptoCurrencyIcon address="0x51B902f19a56F0c8E409a34a215AD2673EDF3284" chainId={42161} css={{ height: 20 }} />*/}
              {/*    </Flex>*/}
              {/*  </Flex>*/}
              {/*</Flex>*/}
            </Flex>
          )}
        </Flex>
      </Flex>
      <Flex
        direction="column"
        css={{
          gridArea: 'cta',
          overflow: 'hidden',
          borderRadius: 12,
          backgroundColor: '$gray3',
        }}
      >
        <Flex
          justify="between"
          align="center"
          css={{
            backgroundColor: '$gray6',
            p: 16
          }}
        >
          <Text style="h5">{`Selections(${(Object.keys(selections)).length})`}</Text>
          <Button size="xs" color="primary" onClick={() => {
            setSelections?.({})
          }}>
            Clear
          </Button>
        </Flex>
        <Flex
          justify="between"
          direction="column"
          css={{
            p: 16,
            gap: 20,
            position: 'relative',
            alignContent: 'space-between',
            flex: 1
          }}
        >
          <Flex
            direction="column"
            css={{
              gap: 10,
              flex: 1,
              overflowY: 'auto',
              maxHeight: 420
            }}>
            {(Object.keys(selections)).map((k: string) => (
              <SelectionItem
                key={k}
                data={selections[k]}
                onApprove={(approved: boolean) => {
                  setSelections?.({
                    ...selections,
                    [k]: {
                      ...selections[k],
                      approved
                    }
                  })
                }}
              />
            ))}
          </Flex>
          <FortuneDepositModal
            roundId={roundId}
          />
        </Flex>
      </Flex>
    </>
  )
};

export default FortuneEntryForm;
