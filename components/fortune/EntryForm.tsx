import {FC, SyntheticEvent, useContext, useEffect, useMemo, useRef, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {TokenMedia, useUserTokens} from '@reservoir0x/reservoir-kit-ui'
import {faClose, faArrowLeft} from "@fortawesome/free-solid-svg-icons";
import {AddressZero} from "@ethersproject/constants";
import * as Dialog from '@radix-ui/react-dialog'
import {ethers} from "ethers";
import {useIntersectionObserver} from "usehooks-ts";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction
} from "wagmi";
import {parseEther} from "ethers/lib/utils";
import {BigNumber} from "@ethersproject/bignumber";
import {useMediaQuery} from "react-responsive";

import NumericalInput from "../bridge/NumericalInput";
import {Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import {useFortune, useMarketplaceChain, useMounted} from "../../hooks";
import SelectionItem from "./SelectionItem";
import NFTEntry, { SelectionData } from "./NFTEntry";
import FortuneAbi from "../../artifact/FortuneAbi.json";
import {FORTUNE_CHAINS} from "../../utils/chains";
import {ToastContext} from "../../context/ToastContextProvider";
import { AnimatedOverlay, AnimatedContent } from "../primitives/Dialog";
import Link from "next/link";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";
import ERC721Abi from "../../artifact/ERC721Abi.json";
import TransferManagerABI from "../../artifact/TransferManagerABI.json";

type EntryProps = {
  roundId: number,
  show: boolean
  lessThan30Seconds: boolean
  onClose: () => void
}

const minimumEntry = BigNumber.from(parseEther('0.005').toString())

const FortuneEntryForm: FC<EntryProps> = ({ roundId,lessThan30Seconds,  show, onClose }) => {
  const { address } = useAccount()
  const [loading, setLoading] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const { addToast } = useContext(ToastContext)
  const [showTokenEntry, setShowTokenEntry] = useState(false)
  const [valueEth, setValueEth] = useState<string>('')
  const [valueNFTE, setValueNFTE] = useState<string>('')
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const [selections, setSelections] = useState<Record<string, SelectionData>>({})
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
  const fortuneChain = FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id);

  const tweetText = `I just placed my bet on #Fortune at @NFTEarth_L2!\n\n🎉 #Winner takes all 🎉\n\n`

  const { data: isApproved, refetch: refetchApproval } = useContractRead({
    enabled: !!fortuneChain?.transferManager && !!address,
    abi: TransferManagerABI,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'hasUserApprovedOperator',
    args: [address, fortuneChain?.address],
  })

  const { writeAsync: grantApproval, error: approvalError } = useContractWrite({
    abi: TransferManagerABI,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'grantApprovals',
    args: [[fortuneChain?.address]],
  })

  const { writeAsync, data: sendData, isLoading, error: error } = useContractWrite({
    abi: FortuneAbi,
    address: fortuneChain?.address as `0x${string}`,
    functionName: 'deposit',
    args: [roundId, Object.keys(selections).map(s => {
      const selection = selections[s];
      const isErc20 = selection.type === 'erc20'
      const isEth = isErc20 && selection.contract === AddressZero

      return [
        isEth ? 0 : (isErc20 ? 1 : 2),
        selection.contract,
        [BigInt((isErc20 ? selection?.value || 0 : selection?.tokenId || 0))],
        ...(isErc20 ? [] : [
          [
            selection.reservoirOracleFloor?.id as string,
            selection.reservoirOracleFloor?.payload as string,
            selection.reservoirOracleFloor?.timestamp as number,
            selection.reservoirOracleFloor?.signature as string
          ]
        ])
      ];
    })],
    value: BigInt(parseEther(valueEth === '' ? '0' : valueEth).toString())
  })

  const { isLoading: isLoadingTransaction, isSuccess = true, data: txData } = useWaitForTransaction({
    hash: sendData?.hash,
    enabled: !!sendData
  })

  useEffect(() => {
    setOpenModal(!!error || isLoading || isLoadingTransaction || isSuccess);
  }, [error, isLoading, isLoadingTransaction, isSuccess])

  const filteredTokens = useMemo(() => {
    return tokens.filter(t => t.token?.kind === 'erc721' && BigNumber.from(t.token?.collection?.floorAskPrice?.amount?.raw || '0').gte(minimumEntry))
  }, [tokens, minimumEntry])

  useEffect(() => {
    const isVisible = !!loadMoreObserver?.isIntersecting
    if (isVisible) {
      // fetchNextPage()
    }
  }, [loadMoreObserver?.isIntersecting])

  // console.log('TEST')

  const selectionValueEth = useMemo(() => {
    return Object.keys(selections).reduce((a: bigint, k: string) => {
      const selection = selections[k];
      return a + BigInt(selection?.value || 0)
    }, BigInt(0))
  }, [selections])

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
        contract: AddressZero.toString(),
        value: BigInt(parseEther(valueEth === '' ? '0' : valueEth).toString())
      }
    })

    setValueEth('')
  }

  const handleAddNFTE = (e: any) => {
    e.preventDefault();

    setSelections({
      ...selections,
      [`0x51B902f19a56F0c8E409a34a215AD2673EDF3284`]: {
        type: 'erc20',
        name: 'NFTE OFT',
        contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
        value: BigInt(parseEther(valueNFTE === '' ? '0' : valueNFTE).toString())
      }
    })

    setValueNFTE('')
  }

  const handleDeposit = async (e: SyntheticEvent) => {
    e.preventDefault();
    setLoading(true)
    try {
      if (!isApproved) {
        await grantApproval?.().catch(e => {
          console.log(e);
          addToast?.({
            title: 'error',
            description: e.reason || e.message
          })
        })
        await refetchApproval?.()
        return;
      }
      await writeAsync?.()
    } catch (e: any) {
      // console.log(e);
      // addToast?.({
      //   title: 'error',
      //   description: e.reason || e.message
      // })
    }
    setLoading(false)
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
                    <NFTEntry
                      key={`entry-token-${i}`}
                      data={token}
                      selected={!!selections[`${token?.token?.contract}:${token?.token?.tokenId}`]}
                      handleClick={(key, data) => {
                        console.log('CLICK', key, data)
                        if (selections[key]) {
                          const newSelections = {...selections};
                          delete newSelections[key];
                          setSelections(newSelections);
                        } else {
                          setSelections({
                            ...selections,
                            [key]: data
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
                    <Text style="body3">{`(${valueEth})`}</Text>
                    <Text style="subtitle2">{`${valueEth} ETH`}</Text>
                    <CryptoCurrencyIcon address={AddressZero} chainId={marketplaceChain.id} css={{ height: 20 }} />
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
          <Button size="xs" color="secondary" onClick={() => {
            setSelections({})
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
              <SelectionItem key={k} data={selections[k]}/>
            ))}
          </Flex>
          {(Object.keys(selections)).length > 0 && (
            <Flex
              align="center"
              direction="column"
              css={{
                gap: 20
              }}
            >
              {lessThan30Seconds && (
                <Text css={{ color: 'orange', textAlign: 'center' }}>
                  {`Warning: less than 30 seconds left, your transaction might not make it in time.`}
                </Text>
              )}
              <Button
                disabled={isLoading || isLoadingTransaction }
                size="large"
                color={lessThan30Seconds ? 'red' : 'primary'}
                css={{
                  justifyContent: 'center'
                }}
                onClick={handleDeposit}
              >{isApproved ? '(Minimum 0.005E) Deposit' : 'Grant Approval'}</Button>
            </Flex>
          )}
        </Flex>
      </Flex>
      {isMounted && (
        <Dialog.Root modal={true} open={openModal}>
          <Dialog.Portal>
            <AnimatedOverlay
              style={{
                position: 'fixed',
                zIndex: 1000,
                inset: 0,
                maxWidth: '60vw',
                maxHeight: '50vh',
                width: 320,
                backgroundColor: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: '20px',
              }}
            />
            <AnimatedContent style={{
              outline: 'unset',
              position: 'fixed',
              zIndex: 1000,
              transform: 'translate(-50%, 120%)',
            }}>
              <Flex
                justify="between"
                css={{
                  pt: '$5',
                  background: '$gray7',
                  padding: '$5',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: '20px',
                  '@bp600': {
                    flexDirection: 'column',
                    gap: '20px',
                  },
                }}
              >
                {!!error && (
                  <Dialog.Close asChild>
                    <button
                      style={{
                        position: 'absolute',
                        top: 10,
                        right: 15
                      }}
                      onClick={() => setOpenModal(!openModal)}
                      className="IconButton"
                      aria-label="Close"
                    >
                      <FontAwesomeIcon icon={faClose} size="xl" />
                    </button>
                  </Dialog.Close>
                )}
                {isLoading && (
                  <Text style="h6">Please confirm in your wallet</Text>
                )}
                {isLoadingTransaction && (
                  <Text style="h6">Processing your deposit...</Text>
                )}
                {(!!error || !!approvalError ) && (
                  <Text style="h6" css={{ color: 'red' }}>{(error || approvalError as any)?.reason || (error || approvalError)?.message}</Text>
                )}
                {isSuccess && (
                  <>
                    <Text style="h6" css={{ color: 'green' }}>Deposit Success !</Text>
                    <Link
                      rel="noreferrer noopener"
                      target="_blank"
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://app.nftearth.exchange/fortune`)}&hashtags=&via=&related=&original_referer=${encodeURIComponent('https://app.nftearth.exchange')}`}>
                      <Button>
                        {`Tweet your joy !`}
                        <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTwitter}/>
                      </Button>
                    </Link>
                  </>
                )}
              </Flex>
            </AnimatedContent>
          </Dialog.Portal>
        </Dialog.Root>
      )}
    </>
  )
};

export default FortuneEntryForm;