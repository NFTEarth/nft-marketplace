import {Modal} from "../common/Modal";
import {FC} from "preact/compat";
import {useState} from "react";
import {Button} from "../primitives";
import {useNetwork, useSwitchNetwork, useWalletClient} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {useMarketplaceChain} from "../../hooks";

type ClaimModalProps = {
  open?: boolean
  disabled?: boolean
  onClose?: () => void
}

enum BatchClaimStep {
  Nothing,
  Open,
  Select,
  Transaction,
  Complete
}

const ClaimModal: FC<ClaimModalProps> = ({ open: defaultOpen, disabled, onClose }) => {
  const [open, setOpen] = useState(!!defaultOpen)
  const [batchClaimStep, setBatchClaimStep] = useState<BatchClaimStep>(BatchClaimStep.Nothing)
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

  const trigger = (
    <Button disabled={disabled}>Claim Now</Button>
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
          onClose &&
          batchClaimStep === BatchClaimStep.Complete
        ) {
          onClose()
        }
        setOpen(open)
      }}
    >
      Claim Your rewards
    </Modal>
  )
}

export default ClaimModal