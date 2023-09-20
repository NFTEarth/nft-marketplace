import {FC, useContext, useMemo, useRef} from "react";
import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "../primitives";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faLock} from "@fortawesome/free-solid-svg-icons";
import {OFTChain} from "../../utils/chains";
import {BaseError, ContractFunctionExecutionError, ContractFunctionRevertedError, formatEther, parseEther} from "viem";
import dayjs, {Dayjs} from "dayjs";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork, usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";
import xNFTEAbi from 'artifact/xNFTEAbi.json'
import {useMounted} from "../../hooks";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {ToastContext} from "../../context/ToastContextProvider";
import ERC20Abi from "../../artifact/ERC20Abi.json";
import {StakingDepositor} from "../../hooks/useStakingDepositor";
import {formatBN, formatNumber} from "../../utils/numbers";

type Props = {
  APY: number
  value: string
  duration: number
  depositor: StakingDepositor | null
  chain: OFTChain | null
  onSuccess: () => void
}

const roundToWeek = (date: Dayjs) : Dayjs => {
  const aWeek = 7 * 24 * 60 * 60
  let timestamp = date.unix()
  timestamp = Math.round(Math.round(timestamp / aWeek) * aWeek)
  return dayjs(timestamp * 1000)
}

const StakingTab: FC<Props> = (props) => {
  const { APY, value, duration, chain, onSuccess, depositor } = props
  const { address } = useAccount()
  const isMounted = useMounted()
  const { chain: activeChain } = useNetwork()
  const { openConnectModal } = useConnectModal()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: chain?.id,
  })
  const {addToast} = useContext(ToastContext)

  const timeStamp = parseInt(`${depositor?.lockEndTimestamp || 0}`) * 1000;
  const newTime = timeStamp > 0 && timeStamp > (new Date()).getTime() ? new Date(timeStamp) : new Date()
  const timePlusDuration = roundToWeek(dayjs(newTime).add(duration, 'months'))
  const isZeroValue = parseEther(`${+value}`) <= BigInt(0)
  const isZeroDuration = duration < 1

  const { data: allowance } = useContractRead<typeof xNFTEAbi, 'allowance', bigint>({
    enabled: !!address && !!chain?.xNFTE,
    abi:  ERC20Abi,
    address: chain?.LPNFTE as `0x${string}`,
    functionName:  'allowance',
    args: [address, chain?.xNFTE],
  })

  const requireAllowance = BigInt(allowance || 0) < parseEther(`${+value}` || '0');

  const stakingArgs = useMemo(() => {
    if ((depositor?.lockedBalance || BigInt(0)) > BigInt(0)) {

      if (!isZeroValue && !isZeroDuration) {
        return {
          functionName: 'increase_amount_and_time',
          args:[
            parseEther(`${+value}` || '0'),
            Math.round(timePlusDuration.toDate().getTime() / 1000)
          ]
        }
      }

      if (isZeroValue && !isZeroDuration) {
        return {
          functionName: 'increase_unlock_time',
          args:[
            Math.round(timePlusDuration.toDate().getTime() / 1000)
          ]
        }
      }

      if (!isZeroValue && isZeroDuration) {
        return {
          functionName: 'increase_amount',
          args:[
            parseEther(`${+value}` || '0'),
          ]
        }
      }
    }

    return {
      functionName: 'create_lock',
      args: [
        parseEther(`${+value}` || '0'),
        Math.round(timePlusDuration.toDate().getTime() / 1000)
      ]
    }
  }, [depositor, duration, value, newTime, isZeroValue, isZeroDuration])

  const { config, error: preparedError, refetch } = usePrepareContractWrite({
    enabled: !requireAllowance && !!address && !!chain?.xNFTE && (!isZeroValue && !isZeroDuration) || (BigInt(depositor?.lockedBalance || 0)) > BigInt(0),
    address: chain?.xNFTE as `0x${string}`,
    abi: xNFTEAbi,
    ...stakingArgs
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)
  const valueN = parseEther(`${+value}` || '0')
  const { writeAsync: approveAsync, isLoading: isLoadingApproval } = useContractWrite<typeof ERC20Abi, 'approve', undefined>({
    address: chain?.LPNFTE as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [chain?.xNFTE as `0x${string}`, valueN],
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const buttonText = useMemo(() => {
    if (requireAllowance) {
      return 'Approve Spending'
    }

    if (!address) {
      return 'Connect Wallet'
    }

    if (isZeroValue && !depositor?.lockedBalance) {
      return 'Enter Values'
    }

    if (isZeroDuration && !depositor?.lockedBalance) {
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

  const totalValue = depositor?.lockedBalance ? BigInt(depositor?.lockedBalance) + valueN : valueN
  const totalDays = timePlusDuration.diff(dayjs(), 'days')

  const votingPower = useMemo(() => {
    return (+formatEther(totalValue) / 0.01) / 12 * totalDays / 30
  }, [totalValue, totalDays])

  const disableButton = ((isZeroValue || isZeroDuration) && !depositor?.lockedBalance) || !!preparedError || isLoading || isLoadingApproval || isLoadingTransaction

  const handleStake = async () => {
    if (!address) {
      await openConnectModal?.()
      return;
    }

    if (requireAllowance) {
      await approveAsync?.()
    }

    await writeAsync?.()
      .then(() => {
        addToast?.({
          title: 'Success',
          status: 'success',
          description: "Staking Success!"
        })
        onSuccess()
      }).catch(e => {
        refetch()
        addToast?.({
          title: 'Error',
          status: 'error',
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
          <Text style="body2">{`${formatBN(totalValue, 2, 18)} LP NFTE`}</Text>
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
          <Text style="body2">{`${formatNumber(votingPower, 2)} xNFTE`}</Text>
        </Flex>
      </Flex>
      <Flex
        justify="between"
        css={{
          p: '14px 16px',
        }}
      >
        <Text style="body2">Time Left</Text>
        <Text style="body2">{totalDays < 0 ? '- days' : `${totalDays} days`}</Text>
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
          <Text style="body2">{totalDays < 0 ? '-' : timePlusDuration.format('HH:mm, MMM, D, YYYY')}</Text>
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