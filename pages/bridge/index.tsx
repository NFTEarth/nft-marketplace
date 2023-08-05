import {useEffect, useMemo, useState} from "react";
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
import {Box, Button, Flex, Input, Text, Tooltip} from "components/primitives";
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
import ERC721Abi from "artifact/ERC721Abi.json";
import L2ERC721BridgeAbi from "artifact/L2ERC721BridgeAbi.json";
import LoadingSpinner from "components/common/LoadingSpinner";
import {FullscreenModal} from "components/common/FullscreenModal";

// export const L1BridgeContractAddress = '0x3E173b825ADEeF9661920B91A8d50B075Ad51bA5'
// export const L2BridgeContractAddress = '0xf1F839fdd467E4087eADBbB330990077889e79c5'
export const L1BridgeProxyAddress = '0x90aEC282ed4CDcAab0934519DE08B56F1f2aB4d7';
export const L2BridgeProxyAddress = '0x653b58c9D23De54E44dCBFbD94C6759CdDa7f93D';
export const OptimismMintableERC721FactoryAddress = '0xc2106ca72996e49bBADcB836eeC52B765977fd20';

export const supportedChains = [
  {
    id: 1,
    name: 'Ethereum',
    iconUrl: '/icons/eth-icon-light.svg',
    etherscanUrl: 'https://etherscan.io'
  },
  {
    id: 10,
    name: 'Optimism',
    iconUrl: `/icons/optimism-icon-light.svg`,
    etherscanUrl: 'https://optimistic.etherscan.io'
  }
]

const BridgePage = () => {
  const isMounted = useMounted()
  const { address, isConnecting } = useAccount()
  const { chain: activeChain } = useNetwork()
  const isSmallDevice = useMediaQuery({ maxWidth: 600 }) && isMounted
  const [chainId, setChainId] = useState(1);
  const [contract, setContract] = useState('');
  const [tokenId, setTokenId] = useState('');
  const [disabled, setDisabled] = useState(false);

  if (supportedChains.length === 1) {
    return null
  }

  const chain = useMemo(() => {
    return supportedChains.find((chain) => chain.id === chainId) || supportedChains[0];
  }, [chainId]);

  const toChain = useMemo(() => {
    return supportedChains.find((chain) => chain.id !== chainId) || supportedChains[1];
  }, [chainId]);

  const { data: token, isLoading: isLoadingToken } = useBridgeToken({
    chain: chain.name,
    contract,
    tokenId,
  })

  const { data: bridgeCollection, isLoading: isLoadingCollection } = useBridgeCollection({
    chainId: chain.id,
    contract,
    tokenId,
  })

  const fromL1 = useMemo(() => chain.id === 1, [chain]);
  const bridgeAddress = useMemo(() => fromL1 ? L1BridgeProxyAddress : L2BridgeProxyAddress, [fromL1]);
  const collectionAddress = useMemo(() => fromL1 ? contract : bridgeCollection, [fromL1, bridgeCollection])
  const mirrorCollectionAddress = useMemo(() => fromL1 ? bridgeCollection : contract, [fromL1, bridgeCollection])

  const { switchNetworkAsync } = useSwitchNetwork()
  const [timestamp, setTimestamp] = useState(dayjs().add(15, 'minutes'));

  const { data: isApproved, refetch: refetchApproval } = useContractRead({
    enabled: !!(address && bridgeAddress),
    abi: ERC721Abi,
    address: collectionAddress,
    functionName: 'isApprovedForAll',
    args: [address, bridgeAddress]
  })

  console.log(collectionAddress, bridgeAddress, isApproved);

  const { writeAsync: approveAll, error: approvalError } = useContractWrite({
    abi: ERC721Abi,
    address: collectionAddress,
    functionName: 'setApprovalForAll',
    args: [bridgeAddress, true]
  })

  const { config, error: preparedError } = usePrepareContractWrite({
    abi: L2ERC721BridgeAbi,
    address: bridgeAddress,
    functionName: 'bridgeERC721',
    args: [collectionAddress, mirrorCollectionAddress, parseInt(tokenId), 1_200_000, 0x0]
  })
  const { data: sendData, sendTransactionAsync: depositToken, isLoading: isLoadingSend, error } = useSendTransaction(config)
  const { isLoading: isLoadingTransaction, isSuccess = true, data: txData } = useWaitForTransaction({
    hash: sendData?.hash,
  })

  useEffect(() => {
    if (address) {
      refetchApproval?.();
    }
  }, [address, contract, bridgeAddress])

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

  const trigger = (
    <Button color="gray3" size="small" css={{ py: '$3' }}>
      <img style={{ height: 17 }} src={chain?.iconUrl} />
      <Text style="body1">{chain?.name}</Text>
      <Text css={{ color: '$slate10' }}>
        <FontAwesomeIcon icon={faChevronDown} width={16} height={16} />
      </Text>
    </Button>
  )

  const isLoading = isLoadingToken || isConnecting || isLoadingCollection;

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

    const owner = token.owners?.find((owner: any) => owner.owner_address === address)

    if (bridgeAddress === owner?.owner_address) {
      setDisabled(true);
      return 'Token already bridged';
    }

    if (address === owner?.owner_address) {
      setDisabled(true);
      return 'Not your token';
    }

    return 'Enable Collection for Bridging';
  }, [contract, tokenId, token, isLoading, address, bridgeAddress])

  return (
    <Layout>
      <Box
        css={{
          p: 14,
          height: '100%',
          '@bp800': {
            p: '$5',
          },
        }}
      >
        <Flex
          justify="center"
          align="center"
          css={{
            padding: 80
          }}
        >
          <Text style="h2">COMING SOON</Text>
        </Flex>
      </Box>
    </Layout>
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
                    <Dropdown trigger={trigger} contentProps={{ sideOffset: 5 }}>
                      {supportedChains.map((chainOption) => {
                        return (
                          <DropdownMenuItem
                            key={chainOption.id}
                            onClick={() => {
                              setChainId(chainOption.id)
                            }}
                          >
                            <Flex align="center" css={{ cursor: 'pointer' }}>
                              <img style={{ width: 17 }} src={chainOption.iconUrl} />
                              <Text style="body1" css={{ ml: '$2' }}>
                                {chainOption.name}
                              </Text>
                            </Flex>
                          </DropdownMenuItem>
                        )
                      })}
                    </Dropdown>
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
                      <Text style="subtitle3">{token?.collection?.name}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Ethereum Address`}</Text>
                      <Text style="subtitle3" as="a" href={`${chain.etherscanUrl}/address/${contract}`}>{truncateAddress(contract || '')}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Token ID`}</Text>
                      <Text style="subtitle3" as="a" href={`${chain.etherscanUrl}/address/${contract}?a=${tokenId}`}>{token?.token_id || ''}</Text>
                    </Flex>
                    <Flex justify="between">
                      <Text style="subtitle3">{`Optimism Address`}</Text>
                      <Text style="subtitle3" as="a" href={`${toChain.etherscanUrl}/address/${mirrorCollectionAddress}`}>{truncateAddress(mirrorCollectionAddress || '')} </Text>
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
                  <img style={{ width: 17, height: 17 }} src={toChain.iconUrl} />
                  <Text style="body1" css={{ ml: '$2' }}>
                    {toChain.name}
                  </Text>
                </Flex>
                <Box css={{ background: '$gray3', overflow: 'hidden', borderRadius: 8 }}>
                  <TokenMedia
                    fallback={
                      () => <img src={'https://via.placeholder.com/230/AAAAAA/FFFFFF/?text='} width={230} height={230}/>
                    }
                    token={{
                      image: token?.image_url || 'https://via.placeholder.com/230/AAAAAA/FFFFFF/?text=',
                      tokenId: token?.token_id
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
                          {token?.collection?.name || '-'}
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
                          {token?.name || `#${token?.token_id || ''}`}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Box>
              </Flex>
            </Flex>
            <FullscreenModal
              trigger={<Button css={{ justifyContent: 'center' }} onClick={depositNFT} disabled={disabled}>{buttonText}</Button>}
            >
              {`Approved : ${isApproved}`}
              <Flex direction="column">
                {!isLoading && (
                  <>
                    <Box className="wallet">
                      <Box>
                        {isApproved ? (
                          <>
                            <FontAwesomeIcon  icon={faCheck}/>
                          </>
                        ) : (
                          <>
                            <LoadingSpinner />1
                          </>
                        )}
                      </Box>

                      {!isApproved ? (
                        <Box>
                          <Text style="h3" as="h3">Approve collection</Text>
                          <Box>
                            Waiting for collection approval transaction to complete
                          </Box>
                        </Box>
                      ) : (
                        <Box>
                          <Text style="h3" as="h3">Approve collection</Text>
                          <Box>
                            Confirm this one-time transaction to bridge items from
                            this collection
                          </Box>
                        </Box>
                      )}
                    </Box>

                    <Flex>
                      <Box>
                        {(isApproved && isSuccess) ? (
                          <>
                            <FontAwesomeIcon  icon={faCheck}/>
                          </>
                        ) : (
                          <>
                            {isApproved ? (
                              <>
                                <LoadingSpinner />2
                              </>
                            ) : (
                              <>
                                <Box />2
                              </>
                            )}
                          </>
                        )}
                      </Box>
                      <Box>
                        <Text>Initiate bridge process</Text>
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
                        Bridging
                      </span>
                        )}
                        {isSuccess && (
                          <Box>
                            <FontAwesomeIcon  icon={faCheck}/>
                            Complete
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
                        Transaction ID
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
                          <Link href={`/collection/optimism/${mirrorCollectionAddress}/${tokenId}`} passHref target="_blank">
                            <Button>View NFT</Button>
                          </Link>
                          <a
                            href={`https://twitter.com/intent/tweet?text=I%20just%20bridged%20an%20NFT%20to%20@optimismFND%20https://nftearth.exchange/collection/optimism/${mirrorCollectionAddress}/${tokenId}%20via%20@NFTEarth_L2`}
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
            </FullscreenModal>
          </Flex>
        </Flex>
        <Footer />
      </Box>
    </Layout>
  )
}

export default BridgePage