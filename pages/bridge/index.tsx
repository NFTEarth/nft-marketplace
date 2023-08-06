import {
  useAccount,
  useSwitchNetwork,
  useChainId,
  useContractReads,
  useContractWrite,
  useWalletClient,
  useWaitForTransaction
} from "wagmi";
import {ChangeEvent, useCallback, useContext, useEffect, useMemo, useState} from "react";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faArrowRight} from "@fortawesome/free-solid-svg-icons";
import { ethers, BigNumber } from 'ethers';
import {useTheme} from "next-themes";

import Layout from "components/Layout";
import { Select, Box, Button, Flex, Text, Input } from "components/primitives";
import {useMarketplaceChain, useMounted} from "hooks";
import Slider from "components/primitives/Slider";
import NumericalInput from "components/bridge/NumericalInput";
import NFTEOFTAbi from 'artifact/NFTEOFTAbi.json'
import {ChainContext} from "context/ChainContextProvider";
import {formatBN} from "utils/numbers";
import supportedChains from "utils/chains";
import {ToastContext} from "../../context/ToastContextProvider";
import {Abi} from "abitype";

const BridgePage = () => {
  const { theme } = useTheme()
  const { addToast } = useContext(ToastContext)
  const { chain, switchCurrentChain } = useContext(ChainContext)
  const [toChainId, setToChainId] = useState<number>(supportedChains[1].id)
  const { openConnectModal } = useConnectModal()
  const [bridgePercent, setBridgePercent] = useState(0);
  const [valueEth, setValueEth] = useState<string>('0.0')
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: chain.id,
  })
  const { data: signer } = useWalletClient()
  const isMounted = useMounted()
  const activeChain = useChainId()
  const { address } = useAccount()

  const NFTEOFT = NFTEOFTAbi as Abi

  // const { data: balanceData } = useContractReads<
  //   [
  //     ContractFunctionConfig<typeof NFTEOFT, 'balanceOf', 'view'>,
  //     ContractFunctionConfig<typeof NFTEOFT, 'estimateSendFee', 'view'>
  //   ],
  //   true
  //   >(

  const { data: balanceData } = useContractReads({
    contracts: [
      {
        abi: NFTEOFT,
        address: chain.contracts?.nfte?.address,
        chainId: chain.id,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      },
      {
        abi: NFTEOFT,
        address: chain.contracts?.nfte?.address,
        chainId: chain.id,
        functionName: 'estimateSendFee',
        args: [
          toChainId,
          ethers.utils.hexZeroPad(address || '0x', 32),
          ethers.utils.parseEther(valueEth || '0'),
          false,
          ethers.utils.solidityPack(
          ['uint16','uint256'],
          [1, 200000]
          )
        ],
      }
    ],
    watch: true,
    enabled: !!address && !!chain.contracts?.nfte,
  })

  const [nfteBalance, estimateFee] = balanceData || []

  console.log(estimateFee);

  useEffect(() => {
    if (nfteBalance?.result) {
      const val = ethers.utils.formatUnits(BigNumber.from(bridgePercent).mul(nfteBalance?.result as number).div(100), 18)
      setValueEth(val)
    }
  }, [bridgePercent])

  const bridgeEnabledChains = supportedChains.filter(p => !!p.contracts?.nfte);

  const toChain = useMemo(() => {
    return bridgeEnabledChains.find((chain) => chain.id === toChainId) || supportedChains[1];
  }, [toChainId]);

  const { writeAsync, data, isLoading, error: error } = useContractWrite<typeof NFTEOFTAbi, 'sendFrom', undefined>({
    address: chain.contracts?.nfte?.address || '0x0',
    abi: NFTEOFTAbi,
    functionName: 'sendFrom',
    value: BigInt(`${ethers.utils.parseEther('0.00001')}`),
    args: [
      address || '0x',
      toChainId,
      ethers.utils.hexZeroPad(address || '0x', 32),
      ethers.utils.parseEther(valueEth || '0'),
      [address, '0xcd0b087e113152324fca962488b4d9beb6f4caf6', '0x']
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
    if (switchNetworkAsync && activeChain !== chain.id) {
      const newChain = await switchNetworkAsync(chain.id)
      if (newChain.id !== chain.id) {
        return false
      }
    }
    if (!signer) {
      openConnectModal?.()
    }

    await writeAsync?.().catch(e => {
      addToast?.({
        title: 'Error',
        description: e.cause.reason || e.shortMessage || e.message
      })
    })
  }

  const handleSetFromChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    switchCurrentChain(idInt);

    if (toChainId === idInt) {
      setToChainId(bridgeEnabledChains.find((chain) => chain.id !== idInt)?.id || 10)
    }
  }, [toChainId])

  const handleSetToChain = useCallback((id: string) => {
    const idInt = parseInt(id);

    setToChainId(idInt);

    if (chain.id === idInt) {
      switchCurrentChain(bridgeEnabledChains.find((chain) => chain.id !== idInt)?.id || 1)
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
          <img style={{ height: 17 }} src={theme === 'dark' ? toChain?.darkIconUrl : toChain?.lightIconUrl } />
        </Flex>
      </Select.Value>
    </Select.Trigger>
  ), [toChain])

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
                NFTEarth Bridge
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
                    <Text>{`Available : ${formatBN(nfteBalance?.result as number || 0, 4, 18 || 10)}`}</Text>
                  </Flex>
                  <Flex align="center" justify="center" css={{ gap: 20 }}>
                    <Select
                      value={`${chain.id}`}
                      onValueChange={handleSetFromChain}
                      trigger={trigger}
                    >
                      {bridgeEnabledChains.map((option) => (
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
                      {bridgeEnabledChains.map((option) => (
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
                  <Text>{`Estimated Fee : ${ethers.utils.formatEther(estimateFee?.result as number || BigNumber.from(0)) || '-'}`}</Text>
                  <Flex justify="center" direction="column" css={{ gap: 40 }}>
                    <Button onClick={handleBridge} disabled={isLoading || isLoadingTransaction}>Bridge</Button>
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