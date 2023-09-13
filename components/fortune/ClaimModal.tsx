import {Modal} from "../common/Modal";
import {FC} from "preact/compat";
import {useContext, useMemo, useState} from "react";
import {Button, Flex, FormatCryptoCurrency, Text} from "../primitives";
import {
  useAccount,
  useNetwork,
  useSwitchNetwork,
  useWalletClient
} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useMarketplaceChain} from "../../hooks";
import ErrorWell from "../primitives/ErrorWell";
import LoadingSpinner from "../common/LoadingSpinner";
import FortuneAbi from "../../artifact/FortuneAbi.json";
import {FORTUNE_CHAINS} from "../../utils/chains";
import TransactionProgress from "../common/TransactionProgress";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faTwitter} from "@fortawesome/free-brands-svg-icons";
import {
  BaseError,
  ContractFunctionRevertedError,
  createPublicClient,
  createWalletClient,
  custom,
  http
} from "viem";
import {ToastContext} from "../../context/ToastContextProvider";

type ClaimModalProps = {
  open?: boolean
  disabled?: boolean
  rewards: (number | number[])[][]
  onClose?: () => void
}

enum BatchClaimStep {
  Nothing,
  Open,
  Select,
  Transaction,
  Complete
}

const ClaimModal: FC<ClaimModalProps> = ({ open: defaultOpen, rewards, disabled, onClose }) => {
  const [open, setOpen] = useState(!!defaultOpen)
  const [step, setStep] = useState(0)
  const [fee, setFee] = useState(BigInt(0))
  const [error, setError] = useState<any | undefined>()
  const { addToast } = useContext(ToastContext)
  const { data: wallet } = useWalletClient()
  const { openConnectModal } = useConnectModal()
  const { chain: activeChain } = useNetwork()
  const marketplaceChain = useMarketplaceChain()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: marketplaceChain.id,
  })

  const isInTheWrongNetwork = Boolean(
    wallet && activeChain?.id !== marketplaceChain.id
  )

  const fortuneChain = FORTUNE_CHAINS.find(c => c.id === marketplaceChain.id);

  const tweetText = `I just claimed my reward from #Fortune on @NFTEarth_L2\n\n🎉 #Winner takes all 🎉\n\nJoin the fun now at this link!`

  const handleClaimReward = async () => {
    setError(undefined)
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

      if (rewards.length > 0) {
        const protocolFeeOwed = await publicClient.readContract({
          address: fortuneChain?.address as `0x${string}`,
          abi: FortuneAbi,
          functionName: 'getClaimPrizesPaymentRequired',
          args: [rewards]
        })

        if (protocolFeeOwed as bigint > BigInt(0)) {
          setFee(protocolFeeOwed as bigint)
        }

        const { request } = await publicClient.simulateContract({
          address: fortuneChain?.address as `0x${string}`,
          abi: FortuneAbi,
          functionName: 'claimPrizes',
          args: [rewards],
          value: BigInt(`${protocolFeeOwed}` || 0n),
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
      }

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
            description: /ABI encoding params/.test((revertError as any).message) ? 'Failed to Claim' : (revertError as any).message
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
    <Button disabled={disabled} onClick={handleClaimReward}>Claim Now</Button>
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
        Claim Now
      </Button>
    )
  }

  return (
    <Modal
      title="Claim Rewards"
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
        css={{ flex: 1, textAlign: 'center', p: '$4', gap: '$4' }}
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
          <Flex css={{ height: '100%', py: '$4' }} align="center">
            <LoadingSpinner />
          </Flex>
        )}
        {step === 2 && (
          <TransactionProgress
            justify="center"
            css={{ mb: '$3' }}
            fromImgs={['/images/fortune.png']}
            toImgs={['/icons/arbitrum-icon-light.svg']}
          />
        )}
        {fee > 0n && (
          <Flex css={{ gap: 20 }}>
            <Text style="h4">You Pay</Text>
            <FormatCryptoCurrency
              amount={fee}
              logoHeight={18}
              textStyle={'h4'}
            />
          </Flex>
        )}
        {step === 1 && (
          <Text style="h6">Please confirm in your wallet</Text>
        )}
        {step === 2 && (
          <Text style="h6">Sending to your wallet</Text>
        )}
        {step === 3 && (
          <Flex direction="column" css={{ gap: 20, my: '$4' }}>
            <Text style="h6" css={{ color: 'green' }}>Claiming Rewards Success!</Text>
            <Button
              as="a"
              rel="noreferrer noopener"
              target="_blank"
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(`https://app.nftearth.exchange/fortune`)}&hashtags=&via=&related=&original_referer=${encodeURIComponent('https://app.nftearth.exchange')}`}
            >
              {`Share your win on X!`}
              <FontAwesomeIcon style={{ marginLeft: 5 }} icon={faTwitter}/>
            </Button>
          </Flex>
        )}
      </Flex>
    </Modal>
  )
}

export default ClaimModal
