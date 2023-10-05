import {FC, useCallback, useContext, useMemo} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faExternalLink, faLock} from "@fortawesome/free-solid-svg-icons";
import {
  parseEther,
  formatEther, parseUnits, formatUnits
} from "viem";
import dayjs, {} from "dayjs";
import { MaxUint256 } from "ethers";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork,
  usePrepareContractWrite,
  useSwitchNetwork,
  useWaitForTransaction,
} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";

import {Box, Button, CryptoCurrencyIcon, Flex, Text, Tooltip} from "../primitives";

import {ToastContext} from "context/ToastContextProvider";
import {StakingDepositor} from "hooks/useStakingDepositor";

import {formatBN, formatNumber} from "utils/numbers";
import {OFT_CHAINS, OFTChain} from "utils/chains";
import {parseError} from "utils/error";

import ERC20Abi from "artifact/ERC20Abi";
import xNFTEAbi from 'artifact/xNFTEAbi'
import {getPublicClient} from "@wagmi/core";
import {roundToWeek} from "../../utils/round";
import Link from "next/link";
import { arbitrum } from "viem/chains";
import Decimal from "decimal.js-light";
import {useAPR} from "../../hooks";

type Props = {
  value: string
  duration: number
  depositor: StakingDepositor | null
  chain: OFTChain | null
  onSuccess: () => void
}

const StakingTab: FC<Props> = (props) => {
  const { value, duration, chain, onSuccess, depositor } = props
  const { address } = useAccount()
  const { openConnectModal } = useConnectModal()
  const publicClient = getPublicClient()
  const {addToast} = useContext(ToastContext)
  const { APR } = useAPR(undefined, OFT_CHAINS[0])

  const valueBn = parseEther((new Decimal(value)).toFixed() as `${number}`)
  const timeStamp = parseInt(`${depositor?.lockEndTimestamp || 0}`);
  const newTime = timeStamp > 0 && timeStamp > dayjs().startOf('day').unix() ? dayjs.unix(timeStamp).startOf('day') : dayjs().startOf('day')
  let timePlusDuration = roundToWeek(dayjs(newTime).add(duration, 'months'))
  timePlusDuration = timePlusDuration.diff(dayjs().startOf('day'), 'days') > 365 ? dayjs().startOf('day').add(365, 'days') : timePlusDuration
  const isZeroValue = parseFloat(value) <= 0
  const isZeroDuration = duration < 1
  const hasLockedBalance = (BigInt(depositor?.lockedBalance || 0)) > BigInt(0)

  const { data: allowance, refetch: refetchAllowance } = useContractRead({
    enabled: !!address && !!chain?.xNFTE,
    abi:  ERC20Abi,
    address: chain?.LPNFTE as `0x${string}`,
    functionName:  'allowance',
    args: [address as `0x${string}`, chain?.xNFTE as `0x${string}`],
  })

  const requireAllowance = parseFloat(formatUnits(allowance  || BigInt(0), 18)) < parseFloat(value);

  const stakingArgs = useMemo(() => {
    if ((depositor?.lockedBalance || BigInt(0)) > BigInt(0)) {
      if (!isZeroValue && !isZeroDuration) {
        return {
          functionName: 'increase_amount_and_time',
          args:[
            valueBn,
            timePlusDuration.unix()
          ]
        }
      }

      if (isZeroValue && !isZeroDuration) {
        return {
          functionName: 'increase_unlock_time',
          args:[
            timePlusDuration.unix()
          ]
        }
      }

      if (!isZeroValue && isZeroDuration) {
        return {
          functionName: 'increase_amount',
          args:[
            valueBn
          ]
        }
      }
    }

    return {
      functionName: 'create_lock',
      args: [
        valueBn,
        timePlusDuration.unix()
      ]
    }
  }, [depositor, duration, value, newTime, isZeroValue, isZeroDuration])

  const { config, error: preparedError, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address && !!chain?.xNFTE && hasLockedBalance || (!isZeroValue && !isZeroDuration),
    address: chain?.xNFTE as `0x${string}`,
    abi: xNFTEAbi,
    ...stakingArgs as any
  })

  const { writeAsync, error, data, isLoading } = useContractWrite(config)
  const { writeAsync: approveAsync, isLoading: isLoadingApproval } = useContractWrite({
    address: chain?.LPNFTE as `0x${string}`,
    abi: ERC20Abi,
    functionName: 'approve',
    args:  [chain?.xNFTE as `0x${string}`, MaxUint256],
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const totalValue = depositor?.lockedBalance ? BigInt(depositor?.lockedBalance) + valueBn : valueBn
  const totalDays = timePlusDuration.diff(dayjs(), 'days')
  const totalMonths = timePlusDuration.diff(dayjs(), 'months')

  const buttonText = useMemo(() => {
    if (isSuccess) {
      return 'Liqudity Added'
    }

    if (!address) {
      return 'Connect Wallet'
    }

    if (isZeroValue && totalValue <= BigInt(0)) {
      return 'Enter Values'
    }

    if (isZeroDuration && totalDays <= 0) {
      return 'Enter Duration'
    }

    if (requireAllowance) {
      return 'Approve Spending'
    }

    if (preparedError) {
      const { message } = parseError(preparedError)

      return message
    }

    if (isZeroValue) {
      return 'Increase Duration'
    }

    if (isZeroDuration) {
      return 'Increase Amount'
    }

    return 'Stake'
  }, [address, isZeroValue, isZeroDuration, totalDays, totalValue, preparedError, requireAllowance]);

  const votingPower = useMemo(() => {
    return (totalValue / BigInt(12)) * BigInt(totalMonths)
  }, [totalValue, totalMonths])

  const disableButton = ((isZeroValue || isZeroDuration) && !depositor?.lockedBalance) || (!!preparedError && !requireAllowance) || isLoading || isLoadingApproval || isLoadingTransaction || isSuccess

  const handleStake = useCallback(async () => {
    try {
      if (!address) {
        await openConnectModal?.()
      }

      if (requireAllowance) {
        await approveAsync?.()
          .then((res) => {
            return publicClient.waitForTransactionReceipt(
              {
                confirmations: 5,
                hash: res.hash
              }
            )
          }).then(async () => {
            await refetchAllowance();
            await refetchPrepareContract()
          })
      }

      await writeAsync?.()
        .then((tx) => {
          addToast?.({
            title: 'Success',
            status: 'success',
            description: (
              <Flex
                direction="column"
              >
                <Text css={{ fontSize: 'inherit' }}>{`Staking Successful`}</Text>
                <Link
                  href={`${arbitrum.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`See Tx Receipt`}
                  <FontAwesomeIcon
                    icon={faExternalLink}
                    width={15}
                    height={15}
                    style={{
                      marginLeft: 10
                    }}
                  />
                </Link>
              </Flex>
            )
          })
          onSuccess()
        })
    } catch (e: any) {
      await refetchAllowance();
      await refetchPrepareContract()
      addToast?.({
        title: parseError(e).name,
        status: 'error',
        description: parseError(e).message
      })
    }
  }, [requireAllowance, writeAsync, approveAsync, openConnectModal, addToast, onSuccess])

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
        <Text style="body2">APR</Text>
        <Flex
          align="center"
          css={{
            gap: 5
          }}
        >
          <Text style="body2">{`${APR}%`}</Text>
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
                The APR displayed is based on data from the last claim period. The displayed APR may not represent future yield.
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
          <Text style="body2">{`${formatBN(votingPower, 2, 18)} xNFTE`}</Text>
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