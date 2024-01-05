import {FC, useCallback, useContext, useMemo} from "react";
import {parseError} from "../../utils/error";
import {useAccount, useContractRead, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import {useConnectModal} from "@rainbow-me/rainbowkit";
import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink, faLock} from "@fortawesome/free-solid-svg-icons";
import {ToastContext} from "../../context/ToastContextProvider";
import {formatBN} from "../../utils/numbers";
import {VE_NFTE} from "../../utils/contracts";
import veNFTEAbi from "artifact/veNFTEAbi";
import { base } from "utils/chains";

type UnStakingTabProps = {
  onSuccess: () => void
}
const UnStakingTab: FC<UnStakingTabProps> = (props) => {
  const {onSuccess} = props;
  const {addToast} = useContext(ToastContext)
  const {address} = useAccount()
  const {openConnectModal} = useConnectModal()

  const {data: lockedData} = useContractRead({
    abi: veNFTEAbi,
    address: VE_NFTE,
    functionName: 'locked',
    args: [address as `0x${string}`],
    watch: true,
    chainId: base.id,
    enabled: !!address,
  })

  const [lockedBalance, endTimeStamp] = lockedData || []

  const totalValue = BigInt(lockedBalance || BigInt(0));
  const hasLockedBalance = totalValue > BigInt(0)

  const {config, error: preparedError, refetch: refetchPrepareContract} = usePrepareContractWrite({
    enabled: !!address && hasLockedBalance,
    address: VE_NFTE,
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
      return 'Login'
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
              address={VE_NFTE}
              chainId={base.id}
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