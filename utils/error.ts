import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError
} from "viem";

export const parseError = (error: any) => {
  let name = 'Generic Error'
  let message = ''
  let data = null
  if (error instanceof BaseError) {
    const isInsufficientFundsError = error.walk(e => e instanceof InsufficientFundsError) instanceof InsufficientFundsError
    const isUserRejectedRequestError = error.walk(e => e instanceof UserRejectedRequestError) instanceof UserRejectedRequestError
    const revertError = error.walk(error => error instanceof ContractFunctionRevertedError)
    const execError = error.walk(error => error instanceof ContractFunctionExecutionError)
    name = error.name
    if (revertError instanceof ContractFunctionRevertedError) {
      console.log('revertError', revertError)
      message = revertError.reason || revertError.shortMessage || ''
    } else if (execError instanceof ContractFunctionExecutionError) {
      console.log('execError', execError)
      message = execError.cause.shortMessage ?? ''
    } else {
      console.log('BaseError', execError)
      message = (error as any)?.cause?.shortMessage || (error as any).cause?.message || (error as any).message || ''
    }
  } else {
    console.log('CommonError', error)
    message = error?.cause?.reason || error.message
  }

  return {
    name,
    message,
    original: error
  }
}