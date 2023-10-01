import {Button, Flex} from "../primitives";
import {useNetwork, useSwitchNetwork} from "wagmi";
import supportedChains from 'utils/chains'
import {useMounted} from "../../hooks";

const AlertChainSwitch = ({ chainId } : { chainId?: number }) => {
  const mounted = useMounted()
  const { chain: activeChain } = useNetwork()
  const { switchNetworkAsync } = useSwitchNetwork({
    chainId: chainId,
  })

  const chain = supportedChains.find(c => c.id === chainId)

  if (!mounted || !chain || activeChain?.id === chainId) {
    return null;
  }

  return (
    <Flex
      align="center"
      justify="between"
      css={{
        p: 10,
        backgroundColor: '$red11',
        width: '100%',
        top: 80,
        left: 0,
      }}
    >
      {`${chain.name} network is Required`}
      <Button
        color="red"
        onClick={() => {
          switchNetworkAsync?.();
        }}
      >
        {`Switch to ${chain.name}`}
      </Button>
    </Flex>
  )
}

export default AlertChainSwitch;