import {Button, Flex, Text} from "../primitives";
import ErrorWell from "../primitives/ErrorWell";
import LoadingSpinner from "../common/LoadingSpinner";
import TransactionProgress from "../common/TransactionProgress";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";
import {Modal} from "../common/Modal";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  custom,
  formatEther,
  http,
  parseEther
} from "viem";
import {FC, SyntheticEvent, useCallback, useContext, useEffect, useMemo, useRef, useState} from "react";
import {useAccount, useContractRead, useContractWrite, useWaitForTransaction} from "wagmi";
import TransferManagerABI from "../../artifact/TransferManagerABI.json";
import FortuneAbi from "../../artifact/FortuneAbi.json";
import {AddressZero} from "@ethersproject/constants";
import ERC20Abi from "../../artifact/ERC20Abi.json";
import ERC721Abi from "../../artifact/ERC721Abi.json";
import {useFortune, useMarketplaceChain} from "../../hooks";
import {FORTUNE_CHAINS} from "../../utils/chains";
import {ToastContext} from "../../context/ToastContextProvider";
import {SelectionData} from "./NFTEntry";
import {Round, RoundStatus} from "../../hooks/useFortuneRound";

type FortuneDepositProps = {
  roundId: number
}

type FortuneData = {
  countdown: number
  durationLeft: number
  round: Round
  selections: Record<string, SelectionData>
  valueEth: string
}

const FortuneDepositModal: FC<FortuneDepositProps> = (props) => {
  const { roundId } = props;
  const { address } = useAccount()
  const [ step, setStep] = useState(0)
  const [ error, setError] = useState<any>()
  const [ isSuccess, setIsSuccess] = useState(false)
  const marketplaceChain = useMarketplaceChain()
  const { data: { round, countdown, selections, valueEth }, } = useFortune<FortuneData>(q => q )
  const fortuneChain = FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id);
  const [openModal, setOpenModal] = useState(false)
  const { addToast } = useContext(ToastContext)
  const publicClient = createPublicClient({
    chain: marketplaceChain,
    transport: http()
  })

  const walletClient = createWalletClient({
    chain: marketplaceChain,
    // @ts-ignore
    transport: custom(window?.ethereum)
  })
  let requireApprovals = useRef(0).current

  const tweetText = `I just entered the current round on #Fortune at @NFTEarth_L2\n\n🎉 #Winner takes all 🎉\n\nJoin the fun now at this link!`

  const { data: isApproved, refetch: refetchApproval } = useContractRead({
    enabled: !!fortuneChain?.transferManager && !!address,
    abi: TransferManagerABI,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'hasUserApprovedOperator',
    args: [address, fortuneChain?.address],
  })

  const { writeAsync: grantApproval, isLoading: isApprovalLoading, error: approvalError } = useContractWrite({
    abi: TransferManagerABI,
    address: fortuneChain?.transferManager as `0x${string}`,
    functionName: 'grantApprovals',
    args: [[fortuneChain?.address]]
  })

  const args = useMemo(() => {
    return [roundId, (Object.keys(selections)).map(s => {
      const selection = selections[s];
      const isErc20 = selection.type === 'erc20'
      const isEth = (isErc20 && selection.contract === AddressZero) || selection.type === 'eth'

      return [
        isEth ? 0 : isErc20 ? 1 : 2,
        selection.contract,
        (isErc20 || isEth) ? selection?.values || [BigInt(0)] :
          selection?.tokenIds || [BigInt(0)],
        [
          selection?.reservoirOracleFloor?.id || '0x0000000000000000000000000000000000000000000000000000000000000000' as string,
          selection?.reservoirOracleFloor?.payload || '0x0000000000000000000000000000000000000000000000000000000000000000' as string,
          selection?.reservoirOracleFloor?.timestamp || 0 as number,
          selection?.reservoirOracleFloor?.signature || '0x0000000000000000000000000000000000000000000000000000000000000000' as string
        ]
      ]
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
      if (!isApproved) {
        setStep(2);
        await grantApproval?.()
        await refetchApproval?.()
        return;
      }

      setStep(3);

      const selects =  [...Object.keys(selections)
        .filter((p) => !selections[p].approved)]
      requireApprovals = selects.length;

      for(let select of selects) {
        const selection = selections[select];
        const selectionAbi = selection.type === 'erc20' ?  ERC20Abi : ERC721Abi;
        const selectionFunc = selection.type === 'erc20' ? 'allowance' : 'isApprovedForAll'
        const data = await publicClient.readContract<typeof selectionAbi, typeof selectionFunc>({
          address: selection.contract as `0x${string}`,
          abi: selectionAbi,
          functionName: selectionFunc,
          ...(selection.type === 'erc20' ? {
            args: [address, fortuneChain?.transferManager]
          } : {})
        })

        if (selection.type === 'erc20' && BigInt(data as number) >= (selection.values?.[0] || BigInt(0))) {
          continue
        }

        if (selection.type === 'erc721' && !!data) {
          continue
        }

        const [account] = await walletClient.getAddresses()
        const selectionApprovalFunc = selection.type === 'erc20' ? 'approve' : 'setApprovalForAll'
        const { request } = await publicClient.simulateContract<typeof selectionAbi, typeof selectionApprovalFunc>({
          address: selection.contract as `0x${string}`,
          abi: selectionAbi,
          functionName: selectionApprovalFunc,
          args: selection.type === 'erc20' ?
            [fortuneChain?.transferManager as `0x${string}`, selection.values?.[0]] :
            [fortuneChain?.transferManager as `0x${string}`, true],
          account
        })

        await walletClient.writeContract(request)
        requireApprovals -= 1
      }

      setStep(4);

      const { request } = await publicClient.simulateContract({
        address: fortuneChain?.address as `0x${string}`,
        abi: FortuneAbi,
        functionName: 'deposit',
        args: args,
        account: address,
        value: BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString()),
      })

      const hash = await walletClient.writeContract(request)

      setStep(5)

      await publicClient.waitForTransactionReceipt(
        {
          confirmations: 5,
          hash
        }
      )
      setIsSuccess(true)
      setStep(0);
    } catch (err: any) {
      if (err instanceof BaseError) {
        const revertError = err.walk(err => err instanceof ContractFunctionRevertedError)
        if (revertError instanceof ContractFunctionRevertedError) {
          const errorName = revertError.data?.errorName ?? ''
          addToast?.({
            title: errorName,
            status: 'error',
            description: errorName
          })
        } else {
          setError(err)
        }
      } else {
        addToast?.({
          title: 'Error',
          status: 'error',
          description: err.message
        })
      }
      setStep(0)
    }
    // setLoading(false)
  }, [selections])

  const trigger = (
    <Flex
      align="center"
      direction="column"
      css={{
        gap: 20
      }}
    >
      {(countdown < 30 && round?.status === RoundStatus.Open) && (
        <Text css={{ color: 'orange', textAlign: 'center' }}>
          {`Warning: less than 30 seconds left, your transaction might not make it in time.`}
        </Text>
      )}
      <Button
        disabled={round?.status !== RoundStatus.Open || isApprovalLoading || step === 4 }
        size="large"
        color={countdown < 30 ? 'red' : 'primary'}
        css={{
          justifyContent: 'center'
        }}
        onClick={handleDeposit}
      >{isApproved ? (round?.status !== RoundStatus.Open ? 'Round Closed' : `(Minimum ${formatEther(BigInt(round?.valuePerEntry || 0))}Ξ) Deposit`) : 'Set Approval'}</Button>
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
        css={{ flex: 1, textAlign: 'center', p: '$4', gap: '$4' }}
      >
        {(!!error || !!approvalError) && (
          <ErrorWell
            message={(error || approvalError as any)?.reason || (error || approvalError)?.message}
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
          <Text style="h6">Transfer Manager Approval</Text>
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
            toImgs={['/icons/fortune.png']}
          />
        )}
        {isSuccess && (
          <Flex direction="column" css={{ gap: 20, my: '$4' }}>
            <Text style="h6" css={{ color: 'green' }}>Deposit Success !</Text>
            <Button
              as="a"
              rel="noreferrer noopener"
              target="_blank"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://app.nftearth.exchange/fortune`)}&hashtags=&via=&related=&original_referer=${encodeURIComponent('https://app.nftearth.exchange')}`}
            >
              {`Share your entry on X! `}
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTwitter}/>
            </Button>
          </Flex>
        )}
      </Flex>
    </Modal>
  )
}

export default FortuneDepositModal;