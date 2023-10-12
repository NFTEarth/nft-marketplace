import {Button, Flex, Text} from "../primitives";
import ErrorWell from "../primitives/ErrorWell";
import LoadingSpinner from "../common/LoadingSpinner";
import TransactionProgress from "../common/TransactionProgress";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";
import {Modal} from "../common/Modal";
import {BaseError, parseEther} from "viem";
import {FC, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useNetwork, usePublicClient,
  useSwitchNetwork, useWalletClient,
} from "wagmi";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";
import {arbitrum} from "viem/chains";
import Link from "next/link";
import {AddressZero} from "@ethersproject/constants";

import TransferManagerAbi from "artifact/TransferManagerAbi";
import FortuneAbi from "artifact/FortuneAbi";
import ERC20Abi from "artifact/ERC20Abi";
import ERC721Abi from "artifact/ERC721Abi";
import {ToastContext} from "context/ToastContextProvider";
import {useFortune, useMarketplaceChain, useCountdown} from "hooks";
import {Round, RoundStatus} from "hooks/useFortuneRound";
import {SelectionData} from "./NFTEntry";
import {FORTUNE_CHAINS, getAlchemyNetworkName} from "utils/chains";
import {parseError} from "utils/error";

type FortuneDepositProps = {
  roundId: number
  disabled?: boolean
}

type FortuneData = {
  countdown: number
  durationLeft: number
  round: Round
  selections: Record<string, SelectionData>
  valueEth: string
}

type DepositAbiInput = [bigint, readonly { tokenType: number; tokenAddress: `0x${string}`; tokenIdsOrAmounts: readonly bigint[]; reservoirOracleFloorPrice: { id: `0x${string}`; payload: `0x${string}`; timestamp: bigint; signature: `0x${string}`; }; }[]]

const FortuneDepositModal: FC<FortuneDepositProps> = (props) => {
  const { roundId, disabled } = props;
  const { address } = useAccount()
  const [ step, setStep] = useState(0)
  const [ error, setError] = useState<any>()
  const [ isSuccess, setIsSuccess] = useState(false)
  const marketplaceChain = useMarketplaceChain()
  const { data: { round, selections, valueEth }, } = useFortune<FortuneData>(q => q )
  const fortuneChain = FORTUNE_CHAINS[0];
  const [openModal, setOpenModal] = useState(false)
  const { addToast } = useContext(ToastContext)
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })
  const { chain: activeChain } = useNetwork()
  const { data: walletClient } = useWalletClient({
    chainId: marketplaceChain.id,
  })
  const publicClient = usePublicClient({
    chainId: marketplaceChain.id,
  })
  const cutOffTime = useMemo(() => round?.cutoffTime || 0, [round])
  const [_hours, minutes, seconds] = useCountdown(cutOffTime * 1000)
  const lessThan30Seconds = _hours === 0 && minutes === 0 && seconds < 30

  let requireApprovals = useRef(0).current

  const tweetText = `I just entered the current round of #Fortune on @NFTEarth_L2\n\n🎉 #Winner takes all 🎉\n\nJoin the fun now at this link!`

  const { data: isApproved, refetch: refetchApproval } = useContractRead({
    enabled: !!fortuneChain?.transferManager && !!address,
    abi: TransferManagerAbi,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'hasUserApprovedOperator',
    chainId: fortuneChain.id,
    args: [address as `0x${string}`, fortuneChain?.address as `0x${string}`],
  })

  const { writeAsync: grantApproval, isLoading: isApprovalLoading, error: approvalError } = useContractWrite({
    abi: TransferManagerAbi,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'grantApprovals',
    chainId: fortuneChain.id,
    args: [[fortuneChain?.address as `0x${string}`]]
  })

  const args: DepositAbiInput = useMemo(() => {
    return [BigInt(roundId), (Object.keys(selections)).map(s => {
      const selection = selections[s];
      const isErc20 = selection.type === 'erc20'
      const isEth = (isErc20 && selection.contract === AddressZero) || selection.type === 'eth'

      return {
        tokenType: isEth ? 0 : isErc20 ? 1 : 2,
        tokenAddress: selection.contract as `0x${string}`,
        tokenIdsOrAmounts: (isErc20 || isEth) ? selection?.values || [BigInt(0)] : selection?.tokenIds || [BigInt(0)],
        reservoirOracleFloorPrice: {
          id: selection?.reservoirOracleFloor?.id || '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
          payload: selection?.reservoirOracleFloor?.payload || '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
          timestamp: BigInt(selection?.reservoirOracleFloor?.timestamp || 0),
          signature: selection?.reservoirOracleFloor?.signature || '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`
        }
      }
    })]
  }, [roundId, selections])

  // const { writeAsync, data: sendData, isLoading, error: error } = useContractWrite({
  //   abi: FortuneAbi,
  //   address: fortuneChain?.address as `0x${string}`,
  //   functionName: 'deposit',
  //   args: args,
  //   value: BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString()),
  //   chainId: marketplaceChain.id
  // })
  //
  // const { isLoading: isLoadingTransaction = true, isSuccess = true, data: txData } = useWaitForTransaction({
  //   hash: sendData?.hash,
  //   enabled: !!sendData
  // })

  const showModal = !!error || !!approvalError || isApprovalLoading || isSuccess || !!requireApprovals || step > 0

  useEffect(() => {
    setOpenModal(showModal);
  }, [showModal])

  const handleDeposit = useCallback(async (e?: SyntheticEvent) => {
    e?.preventDefault();
    setStep(1);
    setIsSuccess(false)
    try {
      if (switchNetworkAsync && activeChain && marketplaceChain && activeChain.id !== marketplaceChain.id) {
        const chain = await switchNetworkAsync(marketplaceChain.id)
        if (chain.id !== marketplaceChain.id) {
          return false
        }
      }

      if (!isApproved) {
        setStep(2);
        await grantApproval?.()
        await refetchApproval?.()
      }

      setStep(3);

      const selects =  Object.keys(selections);
      requireApprovals = selects.length;

      for(let select of selects) {
        const selection = selections[select];
        const selectionAbi = selection.type === 'erc20' ?  ERC20Abi : ERC721Abi;
        const selectionFunc = selection.type === 'erc20' ? 'allowance' : 'isApprovedForAll'
        const data = await publicClient.readContract<typeof selectionAbi, typeof selectionFunc>({
          address: selection.contract as `0x${string}`,
          abi: selectionAbi,
          functionName: selectionFunc,
          args: [address as `0x${string}`, fortuneChain?.transferManager as `0x${string}`]
        })

        if (selection.type === 'erc20' && BigInt(data) >= (selection.values?.[0] || BigInt(0))) {
          continue
        }

        if (selection.type === 'erc721' && !!data) {
          continue
        }

        const selectionApprovalFunc = selection.type === 'erc20' ? 'approve' : 'setApprovalForAll'
        const { request } = await publicClient.simulateContract<typeof selectionAbi, typeof selectionApprovalFunc>({
          address: selection.contract as `0x${string}`,
          abi: selectionAbi,
          functionName: selectionApprovalFunc,
          args: (selection.type === 'erc20' ?
            [fortuneChain?.transferManager as `0x${string}`, selection.values?.[0]] :
            [fortuneChain?.transferManager as `0x${string}`, true]) as any,
          account: address
        })

        const approvalTx = await walletClient?.writeContract(request)
        if (approvalTx) {
          await publicClient.waitForTransactionReceipt({
            hash: approvalTx,
            confirmations: 5
          })
        }
        requireApprovals -= 1
      }

      setStep(4);

      const { request } = await publicClient.simulateContract({
        address: fortuneChain?.address as `0x${string}`,
        abi: FortuneAbi,
        functionName: 'deposit',
        args,
        value: BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString()),
        account: address,
      })

      const hash = await walletClient?.writeContract(request)

      setStep(5)

      if (hash) {
        await publicClient.waitForTransactionReceipt(
          {
            confirmations: 5,
            hash
          }
        )
      }
      addToast?.({
        title: 'Success',
        status: 'success',
        description: (
          <Flex
            direction="column"
          >
            <Text css={{ fontSize: 'inherit' }}>{`Fortune Entry Successful`}</Text>
            <Link
              href={`${arbitrum.blockExplorers.etherscan.url}/tx/${hash}`}
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
      setIsSuccess(true)
      setStep(0);
    } catch (err: any) {
      const { name, message } = parseError(err)
      if (err instanceof BaseError) {
        addToast?.({
          title: name,
          status: 'error',
          description: message
        })
      } else {
        setError(err)
      }
      setStep(0)
    }
    // setLoading(false)
  }, [selections, valueEth, isApproved, publicClient, walletClient, switchNetworkAsync, activeChain, marketplaceChain])

  const buttonText = useMemo(() => {
    if (activeChain && activeChain.id !== marketplaceChain.id) {
      return 'Switch Chain'
    }

    if (!isApproved) {
      return 'Set Approval'
    }

    return 'Enter Round'
  }, [isApproved, activeChain, marketplaceChain])

  const trigger = (
    <Flex
      align="center"
      direction="column"
      css={{
        gap: 20
      }}
    >
      {(lessThan30Seconds && round?.status === RoundStatus.Open) && (
        <Text css={{ color: 'orange', textAlign: 'center' }}>
          {`Alert: less than 30 seconds left in round, your transaction might not make it in time.`}
        </Text>
      )}
      <Button
        disabled={round?.status !== RoundStatus.Open || isApprovalLoading || step === 4  || disabled}
        size="large"
        color={lessThan30Seconds ? 'red' : 'primary'}
        css={{
          justifyContent: 'center'
        }}
        onClick={handleDeposit}
      >{buttonText}</Button>
    </Flex>
  )

  return (
    <Modal
      title="Confirm Entries"
      trigger={trigger}
      open={openModal}
      onOpenChange={(open) => {
        setOpenModal(open)
      }}
    >
      <Flex
        direction="column"
        justify="start"
        align="center"
        css={{
          flex: 1,
          textAlign: 'center',
          p: '$4',
          gap: '$4'
        }}
      >
        {(!!error || !!approvalError) && (
          <ErrorWell
            error={error || approvalError}
            css={{
              textAlign: 'left',
              maxWidth: '100%',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        )}
        {(step > 1 && step < 4 || isApprovalLoading || step > 0) && !error && (
          <Flex css={{ height: '100%', py: '$4' }} align="center">
            <LoadingSpinner />
          </Flex>
        )}
        {isApprovalLoading && (
          <Text style="h6">Contract Approval</Text>
        )}
        {/*{isContractApproval && (*/}
        {/*  <Text style="h6">Approval</Text>*/}
        {/*)}*/}
        {step === 1 && (
          <Text style="h6">Please confirm in your wallet</Text>
        )}
        {step === 5 && (
          <Text style="h6">Send to Prize Pool</Text>
        )}
        {step === 5 && (
          <TransactionProgress
            justify="center"
            css={{ mb: '$3' }}
            fromImgs={['/icons/arbitrum-icon-light.svg']}
            toImgs={['/images/fortune.png']}
          />
        )}
        {isSuccess && (
          <Flex direction="column" css={{ gap: 20, my: '$4' }}>
            <Text style="h6" css={{ color: 'green' }}>Deposit Success!</Text>
            <Button
              as="a"
              rel="noreferrer noopener"
              target="_blank"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://app.nftearth.exchange/fortune`)}&hashtags=&via=&related=&original_referer=${encodeURIComponent('https://app.nftearth.exchange')}`}
            >
              {`Share your entry on X!`}
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTwitter} width={20} height={20}/>
            </Button>
          </Flex>
        )}
      </Flex>
    </Modal>
  )
}

export default FortuneDepositModal;
