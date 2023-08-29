import {Modal} from "../common/Modal";
import {FC} from "preact/compat";
import {useContext, useMemo, useState} from "react";
import {Button, Flex, FormatCryptoCurrency, Select, Text, Tooltip} from "../primitives";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useWalletClient
} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useMarketplaceChain} from "../../hooks";
import useFortuneToWithdraw from "../../hooks/useFortuneToWithdraw";
import ErrorWell from "../primitives/ErrorWell";
import LoadingSpinner from "../common/LoadingSpinner";
import FortuneAbi from "../../artifact/FortuneAbi.json";
import {FORTUNE_CHAINS} from "../../utils/chains";
import TransactionProgress from "../common/TransactionProgress";
import {Deposit} from "../../hooks/useFortuneRound";
import {
  BaseError,
  Chain,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  custom,
  http
} from "viem";
import {ToastContext} from "../../context/ToastContextProvider";
import expirationOptions from "../../utils/defaultExpirationOptions";
import CryptoCurrencyIcon from "../primitives/CryptoCurrencyIcon";
import {TokenMedia} from "@reservoir0x/reservoir-kit-ui";

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

const ClaimModal: FC<ClaimModalProps> = ({open: defaultOpen, onClose}) => {
  const [open, setOpen] = useState(!!defaultOpen)
  const [step, setStep] = useState(0)
  const [error, setError] = useState<any | undefined>()
  const {addToast} = useContext(ToastContext)
  const {address} = useAccount()
  const {data: wallet} = useWalletClient()
  const {openConnectModal} = useConnectModal()
  const {chain: activeChain} = useNetwork()
  const [roundId, setRoundId] = useState<number>()
  const marketplaceChain = useMarketplaceChain()
  const {switchNetworkAsync} = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  const {data: deposits} = useFortuneToWithdraw(address, {
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
      setStep(1)
      const publicClient = createPublicClient({
        chain: marketplaceChain,
        transport: http()
      })

      const walletClient = createWalletClient({
        chain: marketplaceChain,
        // @ts-ignore
        transport: custom(window?.ethereum)
      })

      const [account] = await walletClient.getAddresses()
      const {request} = await publicClient.simulateContract({
        address: fortuneChain?.address as `0x${string}`,
        abi: FortuneAbi,
        functionName: 'withdrawDeposits',
        args: [roundId, cancelledDeposits[roundId].indices],
        account
      })

      const hash = await walletClient.writeContract(request)

      setStep(2)

      await publicClient.waitForTransactionReceipt(
        {
          confirmations: 5,
          hash
        }
      )

      setStep(3)
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
          addToast?.({
            title: 'Error',
            status: 'error',
            description: (revertError as any).message
          })
        }
        setStep(0)
        setOpen(false)
      } else {
        console.log(err.stack)
        addToast?.({
          title: 'Error',
          status: 'error',
          description: (err as any).message
        })
        setStep(0)
        setOpen(false)
      }
    }
  }

  const trigger = (
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
        onValueChange={(value: string) => setRoundId(+value)}
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
  )

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
    <Modal
      title={`Withdraw Deposit : Round ${roundId}`}
      trigger={trigger}
      open={open}
      onOpenChange={(open) => {
        if (
          !open &&
          onClose
        ) {
          onClose()
          setStep(0)
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
        {(!!error) && (
          <ErrorWell
            message={(error as any)?.reason || error?.message}
            css={{
              textAlign: 'left',
              maxWidth: '100%',
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap'
            }}
          />
        )}
        {[1, 2].includes(step) && (
          <Flex css={{height: '100%', py: '$4'}} align="center">
            <LoadingSpinner/>
          </Flex>
        )}
        {step === 2 && (
          <TransactionProgress
            justify="center"
            css={{mb: '$3'}}
            fromImgs={['/icons/fortune.png']}
            toImgs={['/icons/arbitrum-icon-light.svg']}
          />
        )}
        {step === 1 && (
          <Text style="h6">Please confirm in your wallet</Text>
        )}
        {step === 2 && (
          <Text style="h6">Sending to your wallet</Text>
        )}
        {step === 3 && (
          <Flex direction="column" css={{gap: 20, my: '$4'}}>
            <Text style="h6" css={{color: 'green'}}>Withdraw Success !</Text>
          </Flex>
        )}
      </Flex>
    </Modal>
  )
}

export default ClaimModal