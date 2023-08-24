import {FC, useEffect, useMemo, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {TokenMedia, useUserTokens} from '@reservoir0x/reservoir-kit-ui'
import {faClose, faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {AddressZero} from "@ethersproject/constants";

import NumericalInput from "../bridge/NumericalInput";
import {Box, Button, CryptoCurrencyIcon, Flex, FormatCryptoCurrency, Text} from "../primitives";
import {ethers} from "ethers";
import {useIntersectionObserver} from "usehooks-ts";
import {useAccount} from "wagmi";
import {parseEther} from "ethers/lib/utils";
import {BigNumber} from "@ethersproject/bignumber";
import Image from "next/image";
import {useMounted} from "../../hooks";
import {useMediaQuery} from "react-responsive";

type EntryProps = {
  show: boolean
  onClose: () => void
}

const minimumEntry = BigNumber.from(parseEther('0.00000005').toString())

const FortuneEntryForm: FC<EntryProps> = ({ show, onClose }) => {
  const { address } = useAccount()
  const [showTokenEntry, setShowTokenEntry] = useState(false)
  const [valueEth, setValueEth] = useState<string>('0.0')
  const [valueNFTE, setValueNFTE] = useState<string>('0.0')
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [selections, setSelections] = useState<Record<string, any>>({})
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
    revalidateIfStale: true,
    revalidateOnMount: true
  })
  const isMounted = useMounted()
  const isMobile = useMediaQuery({ maxWidth: 600 }) && isMounted

  useEffect(() => {
    if (address) {
      mutate?.();
    }
  }, [address])

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => BigNumber.from(t.token?.collection?.floorAskPrice?.amount?.raw || '0').gte(minimumEntry))
  }, [tokens])

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting])

  const handleSetEthValue = (val: string) => {
    try {
      ethers.utils.parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const handleSetNFTEValue = (val: string) => {
    try {
      ethers.utils.parseUnits(val, 18);
      setValueNFTE(val);
    } catch (e) {
      setValueNFTE('0');
    }
  }

  const handleAddEth = (e: any) => {
    e.preventDefault();

    setSelections({
      ...selections,
      [`${AddressZero}`]: {
        type: 'erc20',
        name: 'ETH',
        contract: AddressZero,
        value: BigNumber.from(parseEther(valueEth))
      }
    })
  }

  const handleAddNFTE = (e: any) => {
    e.preventDefault();

    setSelections({
      ...selections,
      [`0x51B902f19a56F0c8E409a34a215AD2673EDF3284`]: {
        type: 'erc20',
        name: 'NFTE OFT',
        contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        value: BigNumber.from(parseEther(valueNFTE))
      }
    })
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
          <Button size="xs" color="secondary" onClick={onClose}>
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
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setShowTokenEntry(true)
                  }}
                >
                  <CryptoCurrencyIcon address={AddressZero} chainId={42161} css={{ height: 15 }} />
                  <Text style="h6" css={{ color: '$primary13' }}>ETH/NFTE OFT</Text>
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
                    <Flex
                      key={`entry-token-${i}`}
                      onClick={() => {
                        const key = `${token?.token?.contract}:${token.token?.tokenId}`
                        if (selections[key]) {
                          const newSelections = {...selections};
                          delete newSelections[key];
                          setSelections(newSelections);
                        } else {
                          setSelections({
                            ...selections,
                            [key]: {
                              type: token.token?.kind,
                              image: token.token?.imageSmall,
                              name: token.token?.collection?.name,
                              tokenId: token.token?.tokenId as string,
                              contract: token?.token?.contract,
                              value: token.token?.collection?.floorAskPrice?.amount?.native
                            }
                          })
                        }
                      }}
                      css={{
                        cursor: 'pointer'
                      }}
                    >
                      <TokenMedia
                        token={{
                          image: token.token?.imageSmall,
                          tokenId: token.token?.tokenId as string
                        }}
                        style={{
                          width: '100%',
                          height: 'auto',
                          transition: 'transform .3s ease-in-out',
                          borderRadius: '$base',
                          aspectRatio: '1/1',
                          border: !!selections[`${token?.token?.contract}:${token.token?.tokenId}`] ? '2px solid hsl(142, 34%, 51%)' : '2px solid #5D770D'
                        }}
                      />
                    </Flex>
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
              <Text style="h5" css={{ mb: 30 }}>Add ETH or NFTE OFT</Text>
              <Flex
                direction="column"
                css={{
                  gap: 10,
                  borderBottom: '1px solid',
                  borderBottomColor: '$gray5',
                  p: 16
                }}
              >
                <Text style="h6">Add ETH</Text>
                <NumericalInput
                  value={valueEth}
                  onUserInput={handleSetEthValue}
                  icon={<Button size="xs" color="primary" onClick={handleAddEth}>Add</Button>}
                  iconStyles={{
                    top: 4,
                    right: 4,
                    left: 'auto'
                  }}
                  containerCss={{
                    width: '100%'
                  }}
                  css={{
                    pl: 20,
                    pr: 70,
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
                    <Text style="body3">{`($1,615.9)`}</Text>
                    <Text style="subtitle2">{`${valueEth} ETH`}</Text>
                    <CryptoCurrencyIcon address={AddressZero} chainId={42161} css={{ height: 20 }} />
                  </Flex>
                </Flex>
              </Flex>
              <Flex
                direction="column"
                css={{
                  gap: 10,
                  borderBottom: '1px solid',
                  borderBottomColor: '$gray5',
                  p: 16
                }}
              >
                <Text style="h6">Add NFTE OFT</Text>
                <NumericalInput
                  value={valueNFTE}
                  onUserInput={handleSetNFTEValue}
                  icon={<Button size="xs" color="primary" onClick={handleAddNFTE}>Add</Button>}
                  iconStyles={{
                    top: 4,
                    right: 4,
                    left: 'auto'
                  }}
                  containerCss={{
                    width: '100%'
                  }}
                  css={{
                    pl: 20,
                    pr: 70,
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
                  <Text>NFTE OFT in wallet:</Text>
                  <Flex align="center" css={{ gap: 10 }}>
                    <Text style="body3">{`($1,615.9)`}</Text>
                    <Text style="subtitle2">{`${valueNFTE} NFTE`}</Text>
                    <CryptoCurrencyIcon address="0x51B902f19a56F0c8E409a34a215AD2673EDF3284" chainId={42161} css={{ height: 20 }} />
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
      {!isMobile && (
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
            <Button size="xs" color="secondary" onClick={() => setSelections({})}>
              Clear
            </Button>
          </Flex>
          <Flex
            direction="column"
            css={{
              p: 16,
              gap: 10,
              position: 'relative',
              pb: 80
            }}
          >
            {(Object.keys(selections)).map((k: string) => {
              const selection = selections[k];

              return (
                selection.type === 'erc20' ? (
                  <Flex
                    key={k}
                    justify="between"
                    css={{
                      gap: 10,
                      p: '$2',
                      backgroundColor: '$gray7',
                      borderRadius: 6,
                    }}
                  >
                    <Text style="subtitle3">{selection.name}</Text>
                    <FormatCryptoCurrency
                      amount={selection.value}
                      address={selection.contract}
                      chainId={selection.chainId}
                      decimals={18}
                      textStyle="subtitle3"
                      logoHeight={14}
                    />
                  </Flex>
                ) : (
                  <Flex
                    key={k}
                    css={{
                      gap: 10,
                      p: '$2',
                      backgroundColor: '$gray5',
                      borderRadius: 6,
                    }}
                  >
                    <Box css={{
                      position: 'relative',
                      width: 60
                    }}>
                      <Image
                        fill
                        src={selection.image}
                        alt={selection.name}
                        style={{
                          width: '100%',
                          objectFit: 'cover',
                          borderRadius: '$base',
                          aspectRatio: '1/1',
                        }}
                      />
                    </Box>
                    <Flex direction="column" css={{ gap: 20 }}>
                      <Text style="subtitle3">{`${selection.name} #${selection.tokenId}`}</Text>
                      <FormatCryptoCurrency
                        amount={selection.value}
                        address={AddressZero}
                        decimals={18}
                        textStyle="subtitle3"
                        logoHeight={14}
                      />
                    </Flex>
                  </Flex>
                )
              )
            })}
            {(Object.keys(selections)).length > 0 && (
              <Flex
                direction="column"
                css={{
                  width: 'calc(100% - 30px)',
                  position: 'absolute',
                  bottom: 10,
                  left: 15,
                }}
              >
                <Button size="large" css={{ justifyContent: 'center' }}>Deposit</Button>
              </Flex>
            )}
          </Flex>
        </Flex>
      )}
    </>
  )
};

export default FortuneEntryForm;