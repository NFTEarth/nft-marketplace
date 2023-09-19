import {FC, useContext, useMemo, useRef} from "react";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "../primitives";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faLock} from "@fortawesome/free-solid-svg-icons";
import chains, {OFTChain} from "../../utils/chains";
import {formatBN} from "../../utils/numbers";
import {BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError, parseEther} from "viem";
import dayjs from "dayjs";
import {
  useAccount, useContractRead,
  useContractWrite,
  useNetwork, usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
  useWalletClient
} from "wagmi";
import xNFTEAbi from 'artifact/xNFTEAbi.json'
import {useMounted} from "../../hooks";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {ToastContext} from "../../context/ToastContextProvider";
import ERC20Abi from "../../artifact/ERC20Abi.json";

type Props = {
  APY: number
  value: string
  duration: number
  chain: OFTChain | null
}

const StakingTab: FC<Props> = (props) => {
  const { APY, value, duration, chain } = props
  const { data: signer } = useWalletClient()
  const isMounted = useMounted()
  const { chain: activeChain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: chain?.id,
  })
  const {addToast} = useContext(ToastContext)

  const now = useRef(dayjs())
  const isZeroValue = parseEther(`${+value}`) <= BigInt(0)
  const isZeroDuration = duration < 1
  const votingPower = useMemo(() => {
    return (parseInt((parseEther(`${+value}`) / parseEther(`${0.01}`)).toString()) / 12) * duration
  }, [value, duration])

  const { data: allowance } = useContractRead<typeof xNFTEAbi, 'allowance', bigint>({
    enabled: !!signer && !!chain?.xNFTE,
    abi:  ERC20Abi,
    address: chain?.LPNFTE as `0x${string}`,
    functionName:  'allowance',
    args: [signer?.account.address, chain?.xNFTE],
  })

  const { config, error: preparedError } = usePrepareContractWrite({
    enabled: !!signer && !!chain?.xNFTE && !isZeroValue && !isZeroDuration,
    address: chain?.xNFTE as `0x${string}`,
    abi: xNFTEAbi,
    functionName: 'create_lock',
    value: BigInt(0),
    args: [
      parseEther(`${+value}` || '0'),
      Math.round(now.current.add(duration, 'months').toDate().getTime() / 1000)
    ],
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)

  const { writeAsync: approveAsync, isLoading: isLoadingApproval } = useContractWrite<typeof ERC20Abi, 'approve', undefined>({
    address: chain?.LPNFTE as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [chain?.xNFTE as `0x${string}`, parseEther(`${+value}` || '0')],
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const buttonText = useMemo(() => {
    if (isZeroValue) {
      return 'Enter Values'
    }

    if (isZeroDuration) {
      return 'Enter Duration'
    }

    if (preparedError) {
      let errorName = '';
      let errorDesc = ''
      if (preparedError instanceof BaseError) {
        const revertError = preparedError.walk(error => error instanceof ContractFunctionRevertedError)
        const execError = preparedError.walk(error => error instanceof ContractFunctionExecutionError)
        if (revertError instanceof ContractFunctionRevertedError) {
          errorName = revertError.data?.errorName ?? ''
          errorDesc = revertError.reason || revertError.shortMessage || ''
        } else if (execError instanceof ContractFunctionExecutionError) {
          errorName = execError.cause?.name ?? ''
          errorDesc = execError.cause.shortMessage ?? ''
        } else {
          errorName = (error as any)?.cause?.name || (error as any).name || ''
          errorDesc = (error as any)?.cause?.shortMessage || (error as any).cause?.message || (error as any).message || ''
        }
      } else {
        errorName = 'Error'
        errorDesc = preparedError.message
      }

      return errorDesc
    }

    return 'Stake'
  }, [value, duration, preparedError]);
  const disableButton = useMemo(() => isZeroValue || isZeroDuration || !!preparedError || isLoading || isLoadingApproval || isLoadingTransaction,
    [isZeroDuration, isZeroValue, preparedError, isLoading, isLoadingApproval, isLoadingTransaction])

  const handleStake = async () => {
    if (switchNetworkAsync && activeChain) {
      const ch = await switchNetworkAsync(chain?.id)
      if (ch.id !== chain?.id) {
        return false
      }
    }

    if (!signer) {
      openConnectModal?.()
    }

    if (allowance || BigInt(0) < parseEther(`${+value}` || '0')) {
      await approveAsync?.()
    }

    await writeAsync?.()
      .then(() => {
        // setBridgePercent(0)
        // setValueEth('0.0')
      }).catch(e => {
        addToast?.({
          title: 'Error',
          description: e.cause?.reason || e.shortMessage || e.message
        })
      })
  }

  return (
    <Box>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
          backgroundColor: '$gray2',
          borderRadius: 8
        }}
      >
        <Text style="body2">APY</Text>
        <Flex
          align="center"
          css={{
            gap: 5
          }}
        >
          <Text style="body2">{`${APY}%`}</Text>
          <Tooltip
            content={
              <Text
                style="body3"
                as="p"
                css={{
                  background: '#fff',
                  color: '#000',
                  margin: '-$2',
                  p: '$2',
                  maxWidth: 150
                }}>
                The APY displayed is based on data from the last claim period. The displayed APY may not represent future yield.
              </Text>
            }
          >
            <FontAwesomeIcon icon={faCircleInfo} width={10} height={10}/>
          </Tooltip>
        </Flex>
      </Flex>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
        }}
      >
        <Text style="body2">Locked Amount</Text>
        <Flex
          align="center"
          css={{
            gap: 5
          }}
        >
          <CryptoCurrencyIcon
            address={chain?.LPNFTE as `0x${string}`}
            chainId={chain?.id}
            css={{
              width: 20,
              height: 20
            }}
          />
          <Text style="body2">{`${value} LP NFTE`}</Text>
        </Flex>
      </Flex>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
          backgroundColor: '$gray2',
          borderRadius: 8
        }}
      >
        <Text style="body2">Voting Power</Text>
        <Flex
          align="center"
          css={{
            gap: 5
          }}
        >
          <CryptoCurrencyIcon
            address={chain?.xNFTE as `0x${string}`}
            chainId={chain?.id}
            css={{
              width: 20,
              height: 20
            }}
          />
          <Text style="body2">{`${votingPower.toFixed(2)} xNFTE`}</Text>
        </Flex>
      </Flex>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
        }}
      >
        <Text style="body2">Time Left</Text>
        <Text style="body2">{isZeroDuration ? '- days' : `${dayjs(now.current).add(duration, 'months').diff(now.current, 'days')} days`}</Text>
      </Flex>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
          backgroundColor: '$gray2',
          borderRadius: 8
        }}
      >
        <Text style="body2">Lock Until</Text>
        <Flex
          align="center"
          css={{
            gap: 5
          }}
        >
          <Text style="body2">{isZeroDuration ? '-' : dayjs(now.current).add(duration, 'months').format('HH:mm, MMM, D, YYYY')}</Text>
          <FontAwesomeIcon icon={faLock} width={10} height={10}/>
        </Flex>
      </Flex>
      <Button
        disabled={disableButton}
        color="primary"
        size="large"
        css={{
          mt: 20,
          width: '100%',
          display: 'inline-block'
        }}
        onClick={handleStake}
      >
        {buttonText}
      </Button>
    </Box>
  );
}

export default StakingTab