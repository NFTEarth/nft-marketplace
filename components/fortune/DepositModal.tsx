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
import {FC, SyntheticEvent, useContext, useEffect, useRef, useState} from "react";
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
import {minimumEntry} from "./EntryForm";

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
    args: [[fortuneChain?.address]],
  })

  const { writeAsync, data: sendData, isLoading, error: error } = useContractWrite({
    abi: FortuneAbi,
    address: fortuneChain?.address as `0x${string}`,
    functionName: 'deposit',
    args: [roundId, Object.keys(selections).map(s => {
      const selection = selections[s];
      const isErc20 = selection.type === 'erc20'
      const isEth = isErc20 && selection.contract === AddressZero

      return [
        isEth ? 0 : (isErc20 ? 1 : 2),
        selection.contract,
        isErc20 ? selection?.values || 0 : selection?.tokenIds || 0,
        ...(isErc20 ? [] : [
          [
            selection.reservoirOracleFloor?.id as string,
            selection.reservoirOracleFloor?.payload as string,
            selection.reservoirOracleFloor?.timestamp as number,
            selection.reservoirOracleFloor?.signature as string
          ]
        ])
      ];
    })],
    value: BigInt(parseEther(`${valueEth === '' ? 0 : +valueEth}`).toString())
  })

  const { isLoading: isLoadingTransaction = true, isSuccess = true, data: txData } = useWaitForTransaction({
    hash: sendData?.hash,
    enabled: !!sendData
  })

  const showModal = !!error || !!approvalError || isApprovalLoading || isLoading || isLoadingTransaction || isSuccess || !!requireApprovals

  useEffect(() => {
    setOpenModal(showModal);
  }, [showModal])


  const handleDeposit = async (e?: SyntheticEvent) => {
    e?.preventDefault();
    setOpenModal(true);
    try {
      if (!isApproved) {
        await grantApproval?.()
        await refetchApproval?.()
        return;
      }

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
          functionName: selectionFunc
        })

        if (selection.type === 'erc20' && (data as bigint) >= (selection.values?.[0] || BigInt(0))) {
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
            [fortuneChain?.address as `0x${string}`, 0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff] :
            [fortuneChain?.address as `0x${string}`, true],
          account
        })

        await walletClient.writeContract(request)
        requireApprovals -= 1
      }

      await writeAsync?.()

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
        }
      }
      setOpenModal(true);
    }
    // setLoading(false)
  }

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
        disabled={round?.status !== RoundStatus.Open || isApprovalLoading || isLoading || isLoadingTransaction }
        size="large"
        color={countdown < 30 ? 'red' : 'primary'}
        css={{
          justifyContent: 'center'
        }}
        onClick={handleDeposit}
      >{isApproved ? (round?.status !== RoundStatus.Open ? 'Round Closed' : `(Minimum ${formatEther(minimumEntry)}Ξ) Deposit`) : 'Set Approval'}</Button>
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
        {(isLoading || isApprovalLoading) && !error && (
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
        {isLoading && (
          <Text style="h6">Please confirm in your wallet</Text>
        )}
        {isLoadingTransaction && (
          <Text style="h6">Send to Prize Pool</Text>
        )}
        {isLoadingTransaction && (
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