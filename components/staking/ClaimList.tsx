import {Box, Button, CryptoCurrencyIcon, Flex, Text} from "../primitives";
import {useAccount, useContractWrite, usePrepareContractWrite, useWaitForTransaction} from "wagmi";
import FeeDistributorAbi from "../../artifact/FeeDistributorAbi";
import { base } from "utils/chains";
import {formatBN} from "../../utils/numbers";
import {parseError} from "../../utils/error";
import {useContext} from "react";
import {ToastContext} from "../../context/ToastContextProvider";
import LoadingSpinner from "../common/LoadingSpinner";
import Link from "next/link";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faExternalLink} from "@fortawesome/free-solid-svg-icons";
import useUSDAndNativePrice from "../../hooks/useUSDAndNativePrice";
import { NFTEOFT, STAKING_FEE_DISTRIBUTOR, WETH_ADDRESS} from "../../utils/contracts";

const claimableTokens : `0x${string}`[] = [
  WETH_ADDRESS,
  NFTEOFT
]

const ClaimList = () => {
  const { address } = useAccount()
  const {addToast} = useContext(ToastContext)
  const { config, error: preparedError, data: preparedData, refetch: refetchPrepareContract } = usePrepareContractWrite({
    enabled: !!address,
    address: STAKING_FEE_DISTRIBUTOR,
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
    chainId: base.id,
    contract: WETH_ADDRESS,
    price: preparedData?.result?.[0] || BigInt(0)
  })

  const { data: nfteoftPrice, isLoading: isLoadingNfteoftPrice } = useUSDAndNativePrice({
    enabled: !!preparedData?.result?.[1],
    chainId: base.id,
    contract: NFTEOFT,
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
                <Text css={{ fontSize: 'inherit' }}>{`Rewards Claimed Successfully`}</Text>
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
              borderColor: '#0420FF',
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
                  chainId={base.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
              )}
              {BigInt(preparedData?.result?.[1] || 0) > 0 && (
                <CryptoCurrencyIcon
                  address={claimableTokens[1]}
                  chainId={base.id}
                  css={{
                    width: 20,
                    height: 20
                  }}
                />
              )}
              {BigInt(preparedData?.result?.[2] || 0) > 0 && (
                <CryptoCurrencyIcon
                  address={claimableTokens[2]}
                  chainId={base.id}
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
              <img src="/icons/base-icon-dark.svg" width={14} height={14}  alt="Base"/>
              <Text style="body3" color="dark">Base</Text>
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
                <Text style="body3">Rewards in USD</Text>
                <Text style="subtitle1" css={{ fontWeight: 'bold' }}>{`($${formatBN(
                  BigInt(wethPrice?.usdPrice || 0) +
                  BigInt(nfteoftPrice?.usdPrice || 0),
                  2, 6, { notation: "standard" }
                )})`}</Text>
              </Flex>
            </>
          )}
        </Button>
        ) : (
        <Box
            css={{
            border: '1px dashed #0420FF',
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
      {/*      border: '1px dashed #0420FF',*/}
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