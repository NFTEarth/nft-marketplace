import {useContext, useEffect, useMemo, useState} from "react";
import {FC} from "preact/compat";
import {
  useAccount, useContractWrite,
  useNetwork,
  useSwitchNetwork, useWaitForTransaction,
  useWalletClient
} from "wagmi";
import {
  BaseError,
  ContractFunctionRevertedError,
} from "viem";
import {useConnectModal} from "@rainbow-me/rainbowkit";

import {Button, Flex, FormatCryptoCurrency, Select, Text} from "../primitives";
import ErrorWell from "../primitives/ErrorWell";
import {Modal} from "../common/Modal";
import LoadingSpinner from "../common/LoadingSpinner";
import TransactionProgress from "../common/TransactionProgress";
import {useMarketplaceChain, useFortuneToWithdraw} from "hooks";
import {Deposit} from "hooks/useFortuneRound";
import {FORTUNE_CHAINS} from "utils/chains";
import {ToastContext} from "context/ToastContextProvider";
import FortuneAbi from "artifact/FortuneAbi";
import {parseError} from "../../utils/error";

type ClaimModalProps = {
  open?: boolean
  onClose?: () => void
}

enum BatchClaimStep {
  Nothing,
  Open,
  Select,
  Transaction,
  Complete
}

type WithdrawDeposit = {
  indices: number[]
  value: bigint
}

const WithdrawModal: FC<ClaimModalProps> = ({open: defaultOpen, onClose}) => {
  const [open, setOpen] = useState(!!defaultOpen)
  const [error, setError] = useState<any | undefined>()
  const {addToast} = useContext(ToastContext)
  const {address} = useAccount()
  const {data: wallet} = useWalletClient()
  const {openConnectModal} = useConnectModal()
  const {chain: activeChain} = useNetwork()
  const [roundId, setRoundId] = useState<bigint>()
  const marketplaceChain = useMarketplaceChain()
  const {switchNetworkAsync} = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  const {data: deposits, refetch: refetchDeposits } = useFortuneToWithdraw(address, {
    refreshInterval: 5000
  })
  const disabled = 0 >= (deposits?.length || 0)
  const isInTheWrongNetwork = Boolean(
    wallet && activeChain?.id !== marketplaceChain.id
  )
  const cancelledDeposits: Record<string, WithdrawDeposit> = useMemo(() => {
    const claimList: Record<string, WithdrawDeposit> = {};
    (deposits || []).forEach((d: Deposit) => {
      if (!claimList[d.round.roundId]) {
        claimList[d.round.roundId] = {
          indices: [d.indice],
          value: BigInt(d.entriesCount) * BigInt(d.round.valuePerEntry)
        }
      } else {
        claimList[d.round.roundId].indices.push(d.indice)
        claimList[d.round.roundId].value += (BigInt(d.entriesCount) * BigInt(d.round.valuePerEntry))
      }
    });

    return claimList
  }, [deposits])

  const fortuneChain = FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id);

  const { data, writeAsync: withdrawDeposit, isLoading, error: withdrawError } = useContractWrite({
    address: fortuneChain?.address as `0x${string}`,
    abi: FortuneAbi,
    functionName: 'withdrawDeposits',
    args: [roundId as bigint, cancelledDeposits[`${roundId || 0}`]?.indices.map(BigInt)],
    account: address
  })

  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
    confirmations: 5,
  })

  useEffect(() => {
    setOpen(isLoading || isLoadingTransaction || isSuccess || !!withdrawError)
  }, [isLoading, isLoadingTransaction, isSuccess, withdrawError])

  const handleWithdrawDeposit = async () => {
    setError(undefined)
    if (!roundId) {
      addToast?.({
        title: 'Error',
        status: 'error',
        description: 'Please select round to Withdraw'
      })

      return;
    }

    try {
      withdrawDeposit?.()
      refetchDeposits()
    } catch (err: any) {
      if (err instanceof BaseError) {
        const { name, message } = parseError(err)
        addToast?.({
          title: name,
          status: 'error',
          description: message
        })
        setOpen(false)
      } else {
        console.log(err.stack)
        addToast?.({
          title: 'Error',
          status: 'error',
          description: (err as any).message
        })
        setOpen(false)
      }
    }
  }

  const handleSetRound = (value: string) => {
    setRoundId(BigInt(value))
  }
  if (isInTheWrongNetwork) {
    return (
      <Button
        disabled={disabled}
        onClick={async () => {
          if (isInTheWrongNetwork && switchNetworkAsync) {
            const chain = await switchNetworkAsync(marketplaceChain.id)
            if (chain.id !== marketplaceChain.id) {
              return false
            }
          }

          if (!wallet) {
            openConnectModal?.()
          }
        }}
      >
        Withdraw
      </Button>
    )
  }

  return (
    <>
      <Flex css={{gap: 20}}>
        <Select
          disabled={disabled}
          placeholder="Select Round to withdraw"
          css={{
            flex: 1,
            width: '100%',
            minWidth: 140,
            whiteSpace: 'nowrap',
          }}
          value={`${roundId || ''}`}
          onValueChange={handleSetRound}
        >
          {(deposits || []).map((d) => (
            <Select.Item key={d.round.roundId} value={`${d.round.roundId}`}>
              <Select.ItemText css={{whiteSpace: 'nowrap'}}>
                <Flex direction="column" css={{gap: 10}}>
                  <Text>{`Round ${d.round.roundId}`}</Text>
                  <FormatCryptoCurrency amount={cancelledDeposits[d.round.roundId].value} logoHeight={14}/>
                </Flex>
              </Select.ItemText>
            </Select.Item>
          ))}
        </Select>
        <Button disabled={disabled} onClick={handleWithdrawDeposit}>Withdraw</Button>
      </Flex>
      <Modal
        title={`Withdraw Deposit : Round ${roundId}`}
        open={open}
        onOpenChange={(open) => {
          if (
            !open &&
            onClose
          ) {
            onClose()
          }
          setOpen(open)
        }}
      >
        <Flex
          direction="column"
          justify="start"
          align="center"
          css={{flex: 1, textAlign: 'center', p: '$4', gap: '$4'}}
        >
          {(!!error || !!withdrawError) && (
            <ErrorWell
              error={(error || withdrawError)}
              css={{
                textAlign: 'left',
                maxWidth: '100%',
                wordBreak: 'break-word',
                whiteSpace: 'pre-wrap'
              }}
            />
          )}
          {(isLoading) && (
            <Flex css={{height: '100%', py: '$4'}} align="center">
              <LoadingSpinner/>
            </Flex>
          )}
          {isLoading && (
            <Text style="h6">Please confirm in your wallet</Text>
          )}
          {isLoadingTransaction && (
            <TransactionProgress
              justify="center"
              css={{ mb: '$3' }}
              fromImgs={['/images/fortune.png']}
              toImgs={['/icons/arbitrum-icon-light.svg']}
            />
          )}
          {isSuccess && (
            <Flex direction="column" css={{gap: 20, my: '$4'}}>
              <Text style="h6" css={{color: 'green'}}>Withdrawal Successful</Text>
            </Flex>
          )}
        </Flex>
      </Modal>
    </>
  )
}

export default WithdrawModal