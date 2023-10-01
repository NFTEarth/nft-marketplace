import {FC, ReactNode} from "react";

import {Flex, Text} from "../primitives";
import ErrorWell from "../primitives/ErrorWell";
import LoadingSpinner from "../common/LoadingSpinner";
import TransactionProgress from "../common/TransactionProgress";
import {Modal} from "../common/Modal";

type Props =  {
  trigger: ReactNode
  open: boolean
  setOpen: any
  onClose: any
  step: number
  setStep: any
  error: any
}

const TransactionModal: FC<Props> = (props) => {
  const { trigger, open, setOpen, onClose, step, setStep, error } = props;

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
        {step === 1 && (
          <Text style="h6">Please confirm in your wallet</Text>
        )}
        {step === 2 && (
          <Text style="h6">Sending to your wallet</Text>
        )}
        {step === 3 && (
          <Flex direction="column" css={{ gap: 20, my: '$4' }}>
            <Text style="h6" css={{ color: 'green' }}>Claiming Successful</Text>
          </Flex>
        )}
      </Flex>
    </Modal>
  )
}

export default TransactionModal;