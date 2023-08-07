import {useCallback, useContext, useEffect, useMemo, useState} from "react";
import {
  useAccount,
  useSwitchNetwork,
  useContractReads,
  useContractWrite,
  useWalletClient,
  useWaitForTransaction,
  useContractRead,
  useNetwork
} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
import { ethers, BigNumber } from 'ethers';
import {useTheme} from "next-themes";
import {ContractFunctionConfig, zeroAddress} from "viem";
import {useDebounce} from "usehooks-ts";
import {Abi} from "abitype";

import Layout from "components/Layout";
import { Select, Box, Button, Flex, Text } from "components/primitives";
import Slider from "components/primitives/Slider";
import NumericalInput from "components/bridge/NumericalInput";

import {useMounted} from "hooks";
import {formatBN} from "utils/numbers";
import {OFT_CHAINS} from "utils/chains";
import {ToastContext} from "context/ToastContextProvider";
import NFTEOFTAbi from 'artifact/NFTEOFTAbi.json'

const BridgePage = () => {
  const { theme } = useTheme()
  const { addToast } = useContext(ToastContext)
  const [ fromChainId, setFromChainId ] = useState<number>(OFT_CHAINS[0].id)
  const [ toChainId, setToChainId ] = useState<number>(OFT_CHAINS[1].id)
  const { openConnectModal } = useConnectModal()
  const [bridgePercent, setBridgePercent] = useState(0);
  const [valueEth, setValueEth] = useState<string>('0.0')
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: fromChainId,
  })
  const { data: signer } = useWalletClient()
  const isMounted = useMounted()
  const { chain: activeChain } = useNetwork()
  const { address } = useAccount()

  const debouncedPercent = useDebounce(bridgePercent, 500);
  const debouncedValueEth = useDebounce(valueEth, 500);

  const NFTEOFT = NFTEOFTAbi as Abi

  const chain = useMemo(() => {
    return OFT_CHAINS.find((chain) => chain.id === fromChainId) || OFT_CHAINS[0];
  }, [fromChainId]);

  const toChain = useMemo(() => {
    return OFT_CHAINS.find((chain) => chain.id === toChainId) || OFT_CHAINS[1];
  }, [toChainId]);

  const { data: minDstGasLookup } = useContractRead<typeof NFTEOFT, 'minDstGasLookup'>({
    abi: NFTEOFT,
    address: chain?.address as `0x${string}`,
    functionName: 'minDstGasLookup',
    args: [
      chain.lzId,
      0
    ],
    account: address,
    watch: true,
    chainId: fromChainId,
    enabled: !!chain && !!toChain && !!address,
  })

  const { data: nfteData } : { data: any } = useContractReads<
    [
      ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
      ContractFunctionConfig<typeof NFTEOFT, 'estimateSendFee', 'view'>
    ],
    true
  >({
    contracts: [
      {
        abi: NFTEOFT,
        address: chain.address as `0x${string}`,
        chainId: chain.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi: NFTEOFT,
        address: chain.address as `0x${string}`,
        functionName: 'estimateSendFee',
        chainId: chain.id,
        args: [
          toChain.lzId,
          ethers.utils.hexZeroPad(address || '0x', 32),
          BigInt(ethers.utils.parseEther(debouncedValueEth || '0').toString()),
          false,
          ethers.utils.solidityPack(
            ['uint16', 'uint256'],
            [1, BigInt(minDstGasLookup ? minDstGasLookup.toString() : 200000)]
          )
        ],
      }
    ],
    watch: true,
    enabled: !!address && !!chain && !!toChain,
  })

  const [nfteBalance, estimateFee] = useMemo(() => {
    return nfteData || []
  }, [nfteData])

  useEffect(() => {
    if (nfteBalance?.result) {
      const val = ethers.utils.formatUnits(BigNumber.from(bridgePercent).mul(nfteBalance?.result?.toString()).div(100), 18)
      setValueEth(val)
    }
  }, [debouncedPercent])

  const { writeAsync, data, isLoading } = useContractWrite<typeof NFTEOFTAbi, 'sendFrom', undefined>({
    address: chain.address as `0x${string}`,
    abi: NFTEOFTAbi,
    functionName: 'sendFrom',
    value: BigInt(BigNumber.from(estimateFee?.result?.[0]?.toString() || 300000000000000).div(100).mul(200).toString()),
    args: [
      address || '0x',
      toChain.lzId,
      ethers.utils.hexZeroPad(address || '0x', 32),
      BigInt(ethers.utils.parseEther(debouncedValueEth || '0').toString()),
      [address, zeroAddress, '0x']
    ],
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const handleSetValue = (val: string) => {
    try {
      ethers.utils.parseUnits(val, 18);
      setValueEth(val);
    } catch (e) {
      setValueEth('0');
    }
  }

  const handleBridge = async () => {
    if (switchNetworkAsync && activeChain?.id !== fromChainId) {
      const newChain = await switchNetworkAsync(fromChainId)
      if (newChain.id !== fromChainId) {
        return false
      }
    }

    if (!signer) {
      openConnectModal?.()
    }

    await writeAsync?.()
      .then(() => {
        setBridgePercent(0)
        setValueEth('0.0')
      }).catch(e => {
        addToast?.({
          title: 'Error',
          description: e.cause?.reason || e.shortMessage || e.message
        })
      })
  }

  const handleSetFromChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setFromChainId(idInt);

    if (toChainId === idInt) {
      setToChainId(OFT_CHAINS.find((chain) => chain.id !== idInt)?.id || 10)
    }
  }, [toChainId])

  const handleSetToChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setToChainId(idInt);

    if (chain.id === idInt) {
      setFromChainId(OFT_CHAINS.find((chain) => chain.id !== idInt)?.id || 1)
    }
  }, [chain])

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
          <img style={{ height: 17 }} src={theme === 'dark' ? chain?.darkIconUrl : chain?.lightIconUrl} />
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [chain, theme])

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
          <img style={{ height: 17 }} src={theme === 'dark' ? toChain?.darkIconUrl : toChain?.lightIconUrl } />
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [toChain, theme])

  if (!isMounted) {
    return null;
  }

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
            }
          }}>
          <Flex css={{
            p: '$4',
            border: '1px solid $gray4',
            background: '$gray3',
            borderRadius: 8,
            gap: 30,
            '@lg': {
              p: '$6',
            }
          }} direction="column">
            <Flex
              align="center"
              justify="center"
            >
              <Text style="h4" as="h2">
                Migrate NFTE to NFTE OFT
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
                  minWidth: 500,
                }
              }}>
                <Flex
                  justify="center"
                  align="center"
                  css={{
                    gap: '$5',
                    flexDirection: 'column'
                  }}
                >
                  <Flex css={{ width: '100%' }}>
                    <Text>{`Available : ${formatBN(nfteBalance?.result?.toString() || 0, 4, 18 || 10)}`}</Text>
                  </Flex>
                  <Flex align="center" justify="center" css={{ gap: 20 }}>
                    <Select
                      value={`${chain.id}`}
                      onValueChange={handleSetFromChain}
                      trigger={trigger}
                    >
                      {OFT_CHAINS.map((option) => (
                        <Select.Item key={`chain-from-${option.id}`} value={`${option.id}`}>
                          <Select.ItemText css={{ whiteSpace: 'nowrap' }}>
                            <Flex css={{ gap: 10 }}>
                              <img style={{ width: 17 }} src={theme === 'dark' ? option?.darkIconUrl : option?.lightIconUrl} />
                              <Text style="body1" css={{ ml: '$2' }}>
                                {option.name}
                              </Text>
                            </Flex>
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                    <FontAwesomeIcon icon={faArrowRight} />
                    <Select
                      value={`${toChainId}`}
                      onValueChange={handleSetToChain}
                      trigger={trigger2}
                    >
                      {OFT_CHAINS.map((option) => (
                        <Select.Item key={`chain-to-${option.id}`} value={`${option.id}`}>
                          <Select.ItemText css={{ whiteSpace: 'nowrap' }}>
                            <Flex css={{ gap: 10 }}>
                              <img style={{ width: 17 }} src={theme === 'dark' ? option?.darkIconUrl : option?.lightIconUrl} />
                              <Text style="body1" css={{ ml: '$2' }}>
                                {option.name}
                              </Text>
                            </Flex>
                          </Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select>
                  </Flex>
                  <Text css={{ textAlign: 'center' }}>{`Bridge from ${chain.name} to ${toChain.name}`}</Text>
                  <Slider max={100} step={1} value={[bridgePercent]} onValueChange={val => setBridgePercent(val[0])} css={{ py: 20, width: 300 }}/>
                  <Box css={{ position: 'relative' }}>
                    <NumericalInput
                      value={valueEth}
                      onUserInput={handleSetValue}
                      icon={<Button size="xs" onClick={() => setBridgePercent(100)}>MAX</Button>}
                      iconStyles={{
                        top: 4,
                        left: 4
                      }}
                      containerCss={{
                        width: '100%'
                      }}
                      css={{
                        pl: 80,
                        pr: 60,
                        boxShadow: 'inset 0 0 0 2px $$focusColor',
                        textAlign: 'right',
                      }}
                    />
                    <Text
                      css={{
                        position: 'absolute',
                        top: 10,
                        right: 4,
                        color: '$primary14',
                        width: 50,
                        height: 40,
                        fontSize: 18,
                      }}
                    >NFTE</Text>
                  </Box>
                  <Text>{`Estimated Fee : ${ethers.utils.formatEther(BigNumber.from(estimateFee?.result?.[0]?.toString() || 300000000000000).div(100).mul(200)) || '-'}`}</Text>
                  <Flex align="center" direction="column" css={{ gap: 40 }}>
                    <Box>
                      <Button onClick={handleBridge} disabled={isLoading || isLoadingTransaction}>Bridge</Button>
                    </Box>
                    {isLoadingTransaction && (
                      <Text as="h4">Bridging...</Text>
                    )}
                    {isSuccess && (
                      <Text css={{ color: '$primary14'}}>Token bridged, you should receive the token after the blockchain confirmations</Text>
                    )}
                  </Flex>
                </Flex>
              </Box>
            </Flex>
          </Flex>
        </Flex>
      </Box>
    </Layout>
  )
}

export default BridgePage;