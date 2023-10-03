import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import {useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import FeeDistributorAbi from "../../artifact/FeeDistributorAbi";
import {OFT_CHAINS} from "../../utils/chains";
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
  '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
  '0x912CE59144191C1204E64559FE8253a0e49E6548'
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
    contract: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    price: preparedData?.result?.[0] || BigInt(0)
  })

  const { data: nftePrice, isLoading: isLoadingNFTEPrice } = useUSDAndNativePrice({
    enabled: !!preparedData?.result?.[1],
    chainId: arbitrum.id,
    contract: '0x51B902f19a56F0c8E409a34a215AD2673EDF3284',
    price: preparedData?.result?.[1] || BigInt(0)
  })

  const { data: arbPrice, isLoading: isLoadingARBPrice } = useUSDAndNativePrice({
    enabled: !!preparedData?.result?.[2],
    chainId: arbitrum.id,
    contract: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    price: preparedData?.result?.[2] || BigInt(0)
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
                <Text css={{ fontSize: 'inherit' }}>{`Claim Reward Success!`}</Text>
                <Link
                  href={`${arbitrum.blockExplorers.etherscan.url}/tx/${tx?.hash}`}
                  target="_blank"
                  style={{
                    marginTop: 20
                  }}
                >
                  {`See Receipt`}
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
            <CryptoCurrencyIcon
              address="0x82496243c0a1a39c5c6250bf0115c134Ba76698c"
              chainId={arbitrum.id}
              css={{
                width: 20,
                height: 20
              }}
            />
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
                    <Flex direction="column" css={{ gap: 5 }}>
                      <Text style="h6">WETH</Text>
                      <Text>{formatBN(preparedData?.result?.[0], 2, 18)}</Text>
                    </Flex>
                  )}
                  {BigInt(preparedData?.result?.[1] || 0) > 0 && (
                    <Flex direction="column" css={{ gap: 5 }}>
                      <Text style="h6">NFTE</Text>
                      <Text>{formatBN(preparedData?.result?.[1], 2, 18)}</Text>
                    </Flex>
                  )}
                  {BigInt(preparedData?.result?.[2] || 0) > 0 && (
                    <Flex direction="column" css={{ gap: 5 }}>
                      <Text style="h6">ARB</Text>
                      <Text>{formatBN(preparedData?.result?.[2], 2, 18)}</Text>
                    </Flex>
                  )}
                </Flex>
              </Flex>
              <Flex
                justify="between"
                css={{
                  width: '100%'
                }}
              >
                <Flex
                  direction="column"
                >
                  <Text style="body3">Total Reward</Text>
                  <Text style="subtitle1">{formatBN( BigInt(wethPrice?.nativePrice || 0) + BigInt(nftePrice?.nativePrice || 0) + BigInt(arbPrice?.nativePrice || 0), 2, 18, { notation: "standard" })}</Text>
                </Flex>
                <Flex
                  direction="column"
                >
                  <Text style="body3">(USD)</Text>
                  <Text style="subtitle1">{formatBN( BigInt(wethPrice?.usdPrice || 0) + BigInt(nftePrice?.usdPrice || 0) + BigInt(arbPrice?.usdPrice || 0), 2, 6, { notation: "standard" })}</Text>
                </Flex>
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