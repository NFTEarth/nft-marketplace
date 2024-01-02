import {OFTChain, base} from "../../utils/chains";
import {FC, useCallback, useContext, useMemo} from "react";
import {parseError} from "../../utils/error";
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import dayjs from "dayjs";
import veNFTEAbi from "../../artifact/veNFTEAbi";
import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink, faLock} from "@fortawesome/free-solid-svg-icons";
import {ToastContext} from "../../context/ToastContextProvider";
import {formatBN} from "../../utils/numbers";

type UnStakingTabProps = {
  chain: OFTChain | null
  onSuccess: () => void
}
const UnStakingTab: FC<UnStakingTabProps> = (props) => {
  const {chain, onSuccess} = props;
  const {addToast} = useContext(ToastContext)
  const {address} = useAccount()
  const {openConnectModal} = useConnectModal()

  const {data: lockedData} = useContractRead({
    abi: veNFTEAbi,
    address: chain?.veNFTE as `0x${string}`,
    functionName: 'locked',
    args: [address as `0x${string}`],
    watch: true,
    chainId: chain?.id,
    enabled: !!chain && !!address,
  })

  const [lockedBalance, endTimeStamp] = lockedData || []

  const totalValue = BigInt(lockedBalance || BigInt(0));
  const hasLockedBalance = totalValue > BigInt(0)

  const {config, error: preparedError, refetch: refetchPrepareContract} = usePrepareContractWrite({
    enabled: !!address && !!chain?.veNFTE && hasLockedBalance,
    address: chain?.veNFTE as `0x${string}`,
    abi: veNFTEAbi,
    functionName: 'withdraw'
  })

  const {writeAsync, error, data, isLoading} = useContractWrite(config)
  const {isLoading: isLoadingTransaction, isSuccess = true} = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash
  })

  const buttonText = useMemo(() => {
    if (isSuccess) {
      return 'UnStaked'
    }

    if (!address) {
      return 'Connect Wallet'
    }

    if (totalValue <= BigInt(0)) {
      return 'No Locked Balance'
    }

    if (preparedError) {
      const {message} = parseError(preparedError)

      return message
    }

    return 'UnStake'
  }, [address, totalValue, preparedError]);

  const handleUnStake = useCallback(async () => {
    try {
      if (!address) {
        await openConnectModal?.()
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
                <Text css={{fontSize: 'inherit'}}>{`UnStaking Successful`}</Text>
                <Link
                  href={`${base.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`View Tx Receipt`}
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
      await refetchPrepareContract()
      addToast?.({
        title: parseError(e).name,
        status: 'error',
        description: parseError(e).message
      })
    }
  }, [writeAsync, openConnectModal, addToast, onSuccess])

  const disableButton = !hasLockedBalance || !!preparedError || isLoading || isLoadingTransaction || isSuccess

  return (
    <Box>
      <Flex
        direction="column"
        css={{
          p: '14px 16px',
          backgroundColor: '$gray2',
          borderRadius: 8
        }}
      >
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
        <Button
          disabled={disableButton}
          color="primary"
          size="large"
          css={{
            mt: 20,
            width: '100%',
            display: 'inline-block'
          }}
          onClick={handleUnStake}
        >
          {buttonText}
        </Button>
      </Flex>
    </Box>
  );
}

export default UnStakingTab