import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError, decodeErrorResult,
  InsufficientFundsError,
  UserRejectedRequestError
} from "viem";



const getGeneralError = (err:any) => {


  return err.message;
}

export const parseError = (error: any) => {
  let name = 'Error'
  let message = ''
  if (error instanceof BaseError) {
    const insufficientFundsError = error.walk(e => e instanceof InsufficientFundsError)
    const userRejectedRequestError = error.walk(e => e instanceof UserRejectedRequestError)
    const revertError = error.walk(e => e instanceof ContractFunctionRevertedError)
    const execError = error.walk(e => e instanceof ContractFunctionExecutionError)
    name = error.name
    if (insufficientFundsError instanceof InsufficientFundsError) {
      message = 'Insufficient Funds'
    } else if (userRejectedRequestError instanceof UserRejectedRequestError) {
      message = userRejectedRequestError.shortMessage
    } else if (revertError instanceof ContractFunctionRevertedError) {
      message = revertError.reason || revertError.shortMessage || revertError.message
    } else if (execError instanceof ContractFunctionExecutionError) {
      message = execError.cause.shortMessage ?? ''
    } else {
      message = (error as any)?.cause?.shortMessage || (error as any).cause?.message || (error as any).message || ''
    }
  } else {
    message = error?.cause?.reason || error.message
  }

  if (message === 'Voting lock can be 3 years max') {
    message = 'Max lock time is 1 year'
  }

  if (message === 'Execution reverted for an unknown reason.') {
    message = 'Stake'
  }

  if (/exceeds the balance/.test(message)) {
    message = 'Insufficient balance'
  }

  if (/User rejected/.test(message)) {
    message = 'User rejected the request'
  }

  if (name === 'ZeroDeposits') {
    message = 'You must deposit ETH/ARB/NFTE or an eligible NFT to enter'
  }

  if (name === 'OLD') {
    message = 'Price oracle unable to retrieve token price, try again shortly.'
  }

  return {
    name,
    message,
    original: error
  }
}