import {useCallback, useEffect, useMemo, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faArrowRight,
  faArrowDown,
  faCircleExclamation,
  faCheck
} from "@fortawesome/free-solid-svg-icons";
import {useMediaQuery} from "react-responsive";
import {Close} from "@radix-ui/react-dialog";
import Link from "next/link";
import {TokenMedia} from "@reservoir0x/reservoir-kit-ui";
import {Label} from "@radix-ui/react-label";

import Layout from 'components/Layout'
import { Footer } from 'components/Footer'
import {Box, Button, Flex, Input, Select, Text, Tooltip} from "components/primitives";
import {Dropdown, DropdownMenuItem} from "components/primitives/Dropdown";

import {useMounted} from "hooks";
import {truncateAddress} from "utils/truncate";
import useBridgeToken from "hooks/useBridgeToken";
import {
  useAccount,
  useContractRead,
  usePrepareContractWrite,
  useSwitchNetwork,
  useNetwork,
  useContractWrite,
  useSendTransaction,
  useWaitForTransaction,
} from "wagmi";
import {DepositModal} from "components/bridge/DepositModal";
import useBridgeCollection from "hooks/useBridgeCollection";
import dayjs from "dayjs";
import ERC721Abi from "artifact/ERC721Abi";
import L2ERC721BridgeAbi from "artifact/L2ERC721BridgeAbi.json";
import LoadingSpinner from "components/common/LoadingSpinner";
import {FullscreenModal} from "components/common/FullscreenModal";
import baseSupportedChains, {NFT_BRIDGE} from "../../utils/chains";

const SUPPORTED_NFT_CHAINS = [1,10,42161]
const supportedChains = baseSupportedChains.filter(f => SUPPORTED_NFT_CHAINS.includes(f.id))

const NFTBridgePage = () => {
  const isMounted = useMounted()
  const { address, isConnecting } = useAccount()
  const { chain: activeChain } = useNetwork()
  const isSmallDevice = useMediaQuery({ maxWidth: 600 }) && isMounted
  const [ fromChainId, setFromChainId ] = useState<number>(supportedChains[0].id)
  const [ toChainId, setToChainId ] = useState<number>(supportedChains[1].id)
  const [contract, setContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [disabled, setDisabled] = useState(false);
  const [openModal, setOpenModal] = useState(false);

  const chain = useMemo(() => {
    return supportedChains.find((chain) => chain.id === fromChainId) || supportedChains[0];
  }, [fromChainId]);

  const toChain = useMemo(() => {
    return supportedChains.find((chain) => chain.id === toChainId) || supportedChains[1];
  }, [toChainId]);

  const { data: token, isLoading: isLoadingToken } = useBridgeToken({
    chain: fromChainId,
    contract,
    tokenId,
  })

  const { data: bridgeCollection, isLoading: isLoadingCollection } = useBridgeCollection({
    dstChainId: toChain.id,
    contract,
    tokenId,
  })

  const handleSetFromChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setFromChainId(idInt);

    if (toChainId === idInt) {
      setToChainId(supportedChains.find((chain) => chain.id !== idInt)?.id || 10)
    }
  }, [toChainId])

  const handleSetToChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setToChainId(idInt);

    if (chain.id === idInt) {
      setFromChainId(supportedChains.find((chain) => chain.id !== idInt)?.id || 1)
    }
  }, [chain])

  const bridge = useMemo(() => NFT_BRIDGE[fromChainId], [fromChainId]);

  const { switchNetworkAsync } = useSwitchNetwork()
  const [timestamp, setTimestamp] = useState(dayjs().add(15, 'minutes'));

  const { data: isApproved, refetch: refetchApproval } = useContractRead({
    enabled: !!bridge && !!bridgeCollection && !!address,
    abi: ERC721Abi,
    address: contract as `0x${string}`,
    functionName: 'isApprovedForAll',
    args: [address as `0x${string}`, bridge?.proxy],
  })

  const { writeAsync: approveAll, error: approvalError } = useContractWrite({
    abi: ERC721Abi,
    address: contract as `0x${string}`,
    functionName: 'setApprovalForAll',
    args: [bridge?.proxy, true],
  })

  const { config, error: preparedError } = usePrepareContractWrite({
    enabled: !!bridge && !!bridgeCollection && contract !== '' && tokenId !== '',
    abi: L2ERC721BridgeAbi,
    address: bridge?.proxy,
    functionName: 'bridgeERC721',
    args: [contract, bridgeCollection?.[toChainId], parseInt(tokenId), 1_200_000, 0x0]
  })
  const { data: sendData, sendTransactionAsync: depositToken, isLoading: isLoadingSend, error } = useSendTransaction(config)
  const { isLoading: isLoadingTransaction, isSuccess = true, data: txData } = useWaitForTransaction({
    hash: sendData?.hash,
    enabled: !!sendData
  })

  useEffect(() => {
    if (address) {
      refetchApproval?.();
    }
  }, [address, contract, bridge])

  const depositNFT = async () => {
    if (isLoading) {
      return;
    }

    setTimestamp(dayjs().add(15, 'minutes'))
    if (activeChain?.id !== chain?.id) {
      await switchNetworkAsync?.(chain?.id)
    }

    if (!isApproved) {
      await approveAll?.();
      await refetchApproval?.();
    }

    await depositToken?.();
  };

  let isLoading = isLoadingToken || isConnecting || isLoadingCollection;

  const buttonText = useMemo(() => {
    setDisabled(false);

    if (isLoading) {
      setDisabled(true);
      return 'Loading...';
    }

    if (contract === '') {
      setDisabled(true);
      return 'Enter a valid contract address';
    }

    if (tokenId === '') {
      setDisabled(true);
      return 'Enter a valid token id';
    }

    if (!token) {
      setDisabled(true);
      return 'Token not found';
    }

    if (token?.token?.kind === 'erc1155') {
      setDisabled(true);
      return 'ERC1155 Collection is not yet supported';
    }

    if ((address || '').toLowerCase() !== (token?.token?.owner || '').toLowerCase()) {
      setDisabled(true);
      return 'Not your token';
    }

    return 'Enable Collection for Bridging';
  }, [contract, tokenId, token, isLoading, address])

  const trigger = useMemo(() => (
    <Select.Trigger
      title={chain.name}
      css={{
        py: '$3',
        width: 'auto'
      }}
    >
      <Select.Value asChild>
        <Flex align="center" justify="center" css={{ gap: 10 }}>
          <img style={{ height: 17 }} src={chain?.darkIconUrl} />
          <Text>{chain?.name}</Text>
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [chain])

  const trigger2 = useMemo(() => (
    <Select.Trigger
      title={toChain.name}
      css={{
        py: '$3',
        width: 'auto'
      }}
    >
      <Select.Value asChild>
        <Flex align="center" justify="center" css={{ gap: 10 }} title={toChain.name}>
          <img style={{ height: 17 }} src={toChain?.darkIconUrl} />
          <Text>{chain?.name}</Text>
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [toChain])

  const modalTrigger = (
    <Button
      css={{ justifyContent: 'center' }}
      onClick={depositNFT}
      disabled={disabled}
    >
      {buttonText}
    </Button>
  )

  return (
    <Layout>
      <Box
        css={{
          p: 24,
          height: '100%',
          '@bp800': {
            p: '$6',
          },
        }}
      >
        <Flex
          direction="column"
          css={{
            py: 24,
            '@lg': {
              alignItems: 'center',
              py: 100,
            }
          }}>
          <Flex css={{
            p: '$4',
            border: '1px solid $gray4',
            background: '$gray3',
            borderRadius: 8,
            gap: 30,
            '@lg': {
              gap: 65,
              p: '$6',
            }
          }} direction="column">
            <Flex
              align="center"
              justify="center"
            >
              <Text style="h4" as="h2">
                NFT Bridge
              </Text>
            </Flex>
            <Flex
              justify="center"
              align="center"
              css={{
                gap: 24,
                flexDirection: 'column',
                '@lg': {
                  flexDirection: 'row'
                }
              }}>
              <Box css={{
                p: '$5',
                background: '$gray1',
                borderRadius: 8,
                '@lg': {
                  width: 350,
                }
              }}>
                <Flex css={{
                  gap: '$4',
                  flexDirection: 'column'
                }}>
                  <Flex align="center">
                    <Text css={{ mr: '$2' }}>{`From : `}</Text>
                    <Select
                      value={`${chain.id}`}
                      onValueChange={handleSetFromChain}
                      trigger={trigger}
                    >
                      {supportedChains.map((option) => (
                        <Select.Item key={`chain-from-${option.id}`} value={`${option.id}`}>
                          <Select.ItemText css={{ whiteSpace: 'nowrap' }}>
                            <Flex css={{ gap: 10 }}>
                              <img style={{ width: 17 }} src={option?.darkIconUrl} />
                              <Text style="body1" css={{ ml: '$2' }}>
                                {option.name}
                              </Text>
                            </Flex>
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                  </Flex>
                  <Label>
                    <Text style="subtitle3">{`Contract Address`}</Text>
                    <Input
                      // disabled={isLoading || isLoadingTransaction}
                      value={contract}
                      onChange={(e) => setContract(e.target.value)}
                      containerCss={{
                        width: '100%',
                      }}
                    />
                  </Label>
                  <Label style={{ marginBottom: 20 }}>
                    <Text style="subtitle3">{`Token Id`}</Text>
                    <Input
                      // disabled={isLoading || isLoadingTransaction}
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      containerCss={{
                        width: '100%',
                      }}
                    />
                  </Label>
                </Flex>
                {token ? (
                  <>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Contract Name`}</Text>
                      <Text style="subtitle3">{token?.token?.collection?.name}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Ethereum Address`}</Text>
                      <Text style="subtitle3" as="a" href={`${chain.blockExplorers?.default}/address/${contract}`}>{truncateAddress(contract || '')}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Token ID`}</Text>
                      <Text style="subtitle3" as="a" href={`${chain.blockExplorers?.default}/address/${contract}?a=${tokenId}`}>{token?.token?.tokenId || ''}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Optimism Address`}</Text>
                      <Text style="subtitle3" as="a" href={`${toChain.blockExplorers?.default}/address/${bridgeCollection[toChainId]}`}>{truncateAddress(bridgeCollection[toChainId] || '')} </Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Bridge Time`}</Text>
                      <Text style="subtitle3">{`est. 15 minutes`}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Withdrawal Time`}</Text>
                      <Text style="subtitle3">
                        {`7 days `}
                        <Tooltip
                          sideOffset={4}
                          content={
                            <Text style="body2" css={{ display: 'block' }}>
                              Bridged asset take 7 days to withdraw back to Ethereum
                            </Text>
                          }
                        >
                          <FontAwesomeIcon icon={faCircleExclamation}/>
                        </Tooltip>
                      </Text>
                    </Flex>
                  </>
                ) : <Box style={{ height: 105 }}/>}
              </Box>
              <FontAwesomeIcon icon={isSmallDevice ? faArrowDown : faArrowRight} size="2x"/>
              <Flex
                direction="column"
                align="center"
                css={{
                  p: '$5',
                  background: '$gray1',
                  borderRadius: 8,
                  '@lg': {
                    width: 350,
                  }
                }}>
                <Flex align="center" justify="center" css={{ mb: '$4' }}>
                  <Text css={{ mr: '$2' }}>{`To : `}</Text>
                  <Select
                    value={`${toChainId}`}
                    onValueChange={handleSetToChain}
                    trigger={trigger2}
                  >
                    {supportedChains.map((option) => (
                      <Select.Item key={`chain-to-${option.id}`} value={`${option.id}`}>
                        <Select.ItemText css={{ whiteSpace: 'nowrap' }}>
                          <Flex css={{ gap: 10 }}>
                            <img style={{ width: 17 }} src={option?.darkIconUrl} />
                            <Text style="body1" css={{ ml: '$2' }}>
                              {option.name}
                            </Text>
                          </Flex>
                        </Select.ItemText>
                      </Select.Item>
                    ))}
                  </Select>
                </Flex>
                <Box css={{ background: '$gray3', overflow: 'hidden', borderRadius: 8 }}>
                  <TokenMedia
                    fallback={
                      () => <img src={'https://via.placeholder.com/230/AAAAAA/FFFFFF/?text='} width={230} height={230}/>
                    }
                    token={{
                      image: token?.token?.image || 'https://via.placeholder.com/230/AAAAAA/FFFFFF/?text=',
                      tokenId: token?.token?.tokenId || ''
                    }}
                    style={{
                      width: '100%',
                      transition: 'transform .3s ease-in-out',
                      maxHeight: 230,
                      height: '100%',
                      borderRadius: 0,
                      aspectRatio: '1/1',
                    }}
                  />
                  <Flex
                    css={{ p: '$4', cursor: 'pointer' }}
                    direction="column"
                  >
                    <Flex justify="between" direction="column">
                      <Flex align="center" css={{ gap: '$1', minWidth: 0 }}>
                        <Text
                          style="subtitle3"
                          as="p"
                          ellipsify
                          css={{
                            pr: '$1',
                            flex: 1,
                          }}
                        >
                          {token?.token?.collection?.name || '-'}
                        </Text>
                      </Flex>
                      <Flex align="center" css={{ gap: '$1', minWidth: 0 }}>
                        <Text
                          style="h6"
                          as="p"
                          ellipsify
                          css={{
                            pr: '$1',
                            flex: 1,
                          }}
                        >
                          {token?.token?.name || `#${token?.token?.tokenId || ''}`}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
            <FullscreenModal
              trigger={modalTrigger}
              onOpenChange={setOpenModal}
              open={openModal}
            >
              <Flex justify="center">
                <Flex direction="column" css={{ gap: 40, p: 40 }}>
                  {!isLoading && (
                    <>
                      <Flex align="start" css={{ gap: 20 }}>
                        <Flex align="center" css={{ gap: 20 }}>
                          {isApproved ? (
                            <FontAwesomeIcon icon={faCheck} style={{ fontSize: 40, color: 'hsl(142,34%,40%)' }}/>
                          ) : (
                            <LoadingSpinner />
                          )}
                          <Text style="h3">1</Text>
                        </Flex>

                        <Box>
                          <Text style="h4" as="h4">Approve collection</Text>
                          <Box>
                            {!isApproved ?
                              'Waiting for collection approval transaction to complete' :
                              'Confirm this one-time transaction to bridge items from this collection'}
                          </Box>
                        </Box>
                      </Flex>

                      <Flex align="start" css={{ gap: 20 }}>
                        <Flex align="center" css={{ gap: 20 }}>
                          {(isApproved && isSuccess) ? (
                            <FontAwesomeIcon icon={faCheck} style={{ fontSize: 40, color: 'hsl(142,34%,40%)' }}/>
                          ) : (isApproved ?
                              <LoadingSpinner /> : <Box css={{ content: '', width: 40 }}/>
                          )}
                          <Text style="h3">2</Text>
                        </Flex>
                        <Box>
                          <Text style="h4" as="h4">Initiate bridge process</Text>
                          <Text>
                            Confirm the transaction in your wallet to initiate the
                            bridge process
                          </Text>
                        </Box>
                      </Flex>
                      <Close>
                        <Button color="secondary">Cancel</Button>
                      </Close>
                    </>
                  )}

                  {(isLoading || isSuccess) && (
                    <>
                      {"Your bridge transaction is processing. Please allow up to 15 minutes for the transfer to finalize."}
                      <Flex>
                        <Box>
                          Status
                          {isLoadingTransaction && (
                            <span>
                            <LoadingSpinner />
                              {`Bridging`}
                          </span>
                          )}
                          {isSuccess && (
                            <Box>
                              <FontAwesomeIcon  icon={faCheck}/>
                              {`Complete`}
                            </Box>
                          )}
                        </Box>
                        <Box>
                          Est. Completion
                          <span>
                          {timestamp.toDate().toLocaleString([], {
                            dateStyle: "short",
                            timeStyle: "short",
                          })}
                        </span>
                        </Box>
                        <Flex>
                          {`Transaction ID`}
                          <a
                            href={`${activeChain?.blockExplorers?.default?.url}/tx/${sendData?.hash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {sendData?.hash.slice(0, 6)}...{sendData?.hash.slice(-4)}
                          </a>
                        </Flex>
                      </Flex>
                      <Flex>
                        {isLoadingTransaction && (
                          <>
                            <Button disabled>View NFT</Button>
                            <Link
                              href={`${activeChain?.blockExplorers?.default?.url}/tx/${txData?.transactionHash}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              passHref
                            >
                              <Button className="outline">View Transaction</Button>
                            </Link>
                          </>
                        )}
                        {(isSuccess && tokenId) && (
                          <>
                            <Link href={`/collection/optimism/${bridgeCollection[toChainId]}/${tokenId}`} passHref target="_blank">
                              <Button>View NFT</Button>
                            </Link>
                            <a
                              href={`https://twitter.com/intent/tweet?text=I%20just%20bridged%20an%20NFT%20to%20@optimismFND%20https://nftearth.exchange/collection/${chain.network}/${bridgeCollection?.[toChainId]}/${tokenId}%20via%20@NFTEarth_L2`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Button className="outline">Share on Twitter</Button>
                            </a>
                          </>
                        )}
                      </Flex>
                    </>
                  )}
                </Flex>
              </Flex>
            </FullscreenModal>
          </Flex>
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default NFTBridgePage