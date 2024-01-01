import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import {useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import FeeDistributorAbi from "../../artifact/FeeDistributorAbi";
import {OFT_CHAINS, base} from "../../utils/chains";
import {arbitrum} from "viem/chains";
import {formatBN} from "../../utils/numbers";
import {parseError} from "../../utils/error";
import {useContext} from "react";
import {ToastContext} from "../../context/ToastContextProvider";
import LoadingSpinner from "../common/LoadingSpinner";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";

const claimableTokens : `0x${string}`[] = [
  '0xc2106ca72996e49bBADcB836eeC52B765977fd20',
  '0x4200000000000000000000000000000000000006'
]

const ClaimList = () => {
  const { address } = useAccount()
  const {addToast} = useContext(ToastContext)
  const chain = OFT_CHAINS.find(p => p.id === arbitrum.id)
  const { config, error: preparedError, data: preparedData, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address && !!chain?.feeDistributor,
    address: chain?.feeDistributor as `0x${string}`,
    abi: FeeDistributorAbi,
    functionName: 'claimTokens',
    args: [address as `0x${string}`, claimableTokens]
  })

  const { writeAsync, data, isLoading } = useContractWrite(config)
  const { isLoading: isLoadingTransaction, isSuccess = true } = useWaitForTransaction({
    hash: data?.hash,
    enabled: !!data?.hash,
  })

  const { data: wethPrice, isLoading: isLoadingWethPrice } = useUSDAndNativePrice({
    enabled: !!preparedData?.result?.[0],
    chainId: arbitrum.id,
    contract: '0x4200000000000000000000000000000000000006',
    price: preparedData?.result?.[0] || BigInt(0)
  })

  const { data: nftePrice, isLoading: isLoadingNFTEPrice } = useUSDAndNativePrice({
    enabled: !!preparedData?.result?.[1],
    chainId: arbitrum.id,
    contract: '0xc2106ca72996e49bBADcB836eeC52B765977fd20',
    price: preparedData?.result?.[1] || BigInt(0)
  })

  const loading = isLoading || isLoadingTransaction;
  const disableButton = isLoading || isLoadingTransaction || isSuccess || !!preparedError
  const totalClaimable = BigInt(preparedData?.result?.[0] || 0)// + BigInt(preparedData?.result?.[1] || 0)

  const handleClaimReward = async () => {
    try {
      await writeAsync?.()
        .then(async (tx) => {
          await refetchPrepareContract()
          addToast?.({
            title: 'Success',
            status: 'success',
            description: (
              <Flex
                direction="column"
              >
                <Text css={{ fontSize: 'inherit' }}>{`Claiming Successful`}</Text>
                <Link
                  href={`${base.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`View Txn Receipt`}
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
        })
    } catch (e: any) {
      await refetchPrepareContract()
      addToast?.({
        title: parseError(e).name,
        status: 'error',
        description: parseError(e).message
      })
    }
  }

  return (
    <>
      {(totalClaimable > BigInt(0)) ? (
        <Button
          disabled={disableButton}
          onClick={handleClaimReward}
          css={{
            p: '1rem',
            minHeight: '9.875rem',
            minWidth: '16.125rem',
            flexDirection: 'column',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(255,255,255,0.1)',
            borderColor: 'transparent',
            borderWidth:  1,
            borderStyle: 'solid',
            transition: 'border-color 0.3s',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: '#79ffa8',
            },
            '&:disabled': {
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderColor: 'transparent',
              opacity: 0.5,
              cursor: 'not-allowed',
            }
          }}
        >
          <Flex
            justify="between"
            css={{
              width: '100%'
            }}
          >
            <Flex
              css={{
                gap: 5
              }}
            >
              {BigInt(preparedData?.result?.[0] || 0) > 0 && (
                <CryptoCurrencyIcon
                  address={claimableTokens[0]}
                  chainId={arbitrum.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
              )}
              {BigInt(preparedData?.result?.[1] || 0) > 0 && (
                <CryptoCurrencyIcon
                  address={claimableTokens[1]}
                  chainId={arbitrum.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
              )}
              {BigInt(preparedData?.result?.[2] || 0) > 0 && (
                <CryptoCurrencyIcon
                  address={claimableTokens[2]}
                  chainId={arbitrum.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
              )}
            </Flex>
            <Flex
              align="center"
              css={{
                gap: 5,
                background: '$gray11',
                px: 10,
                borderRadius: 8
              }}
            >
              <img src="/icons/arbitrum-icon-dark.svg" width={14} height={14}  alt="Arbitrum"/>
              <Text style="body3" color="dark">Arbitrum</Text>
            </Flex>
          </Flex>
          {loading ? (
            <Flex
              align="center"
              justify="center"
              css={{
                width: '100%',
                height: 80
              }}
            >
              <LoadingSpinner css={{ width: 60, height: 60 }}/>
          </Flex>
          ) : (
            <>
              <Flex
                justify="between"
                css={{
                  width: '100%'
                }}
              >
                <Flex
                  justify="between"
                  style={{
                    width: '100%'
                  }}
                >
                  {BigInt(preparedData?.result?.[0] || 0) > 0 && (
                    <Flex direction="column">
                      <Text style="h6">WETH</Text>
                      <Text>{formatBN(preparedData?.result?.[0], 2, 18)}</Text>
                    </Flex>
                  )}
                  {BigInt(preparedData?.result?.[1] || 0) > 0 && (
                    <Flex direction="column">
                      <Text style="h6">NFTE</Text>
                      <Text>{formatBN(preparedData?.result?.[1], 2, 18)}</Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
              <Flex
                direction="column"
                css={{
                  width: '100%'
                }}
              >
                <Text style="body3">Total Rewards</Text>
                <Text style="subtitle1" css={{ fontWeight: 'bold' }}>{`${
                  formatBN(
                    BigInt(wethPrice?.nativePrice || 0) +
                    BigInt(nftePrice?.nativePrice || 0)
                    , 2, 18, { notation: "standard" }
                  )} ($${formatBN(
                  BigInt(wethPrice?.usdPrice || 0) +
                  BigInt(nftePrice?.usdPrice || 0),
                  2, 6, { notation: "standard" }
                )})`}</Text>
              </Flex>
            </>
          )}
        </Button>
        ) : (
        <Box
            css={{
            border: '1px dashed #79ffa8',
            opacity: 0.2,
            minWidth: '16.125rem',
            background: '#323232',
            minHeight: '9.875rem',
            borderRadius: '0.75rem',
            content: ' '
          }}
        />
      )}
      {/*{(new Array(3).fill('')).map((x, i) => (*/}
      {/*  <Box*/}
      {/*    key={`box-${i}`}*/}
      {/*    css={{*/}
      {/*      border: '1px dashed #79ffa8',*/}
      {/*      opacity: 0.2,*/}
      {/*      minWidth: '16.125rem',*/}
      {/*      background: '#323232',*/}
      {/*      minHeight: '9.875rem',*/}
      {/*      borderRadius: '0.75rem',*/}
      {/*      content: ' '*/}
      {/*    }}*/}
      {/*  />*/}
      {/*))}*/}
    </>
  )
}

export default ClaimList