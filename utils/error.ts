import {
  BaseError,
  ContractFunctionExecutionError,
  ContractFunctionRevertedError,
  InsufficientFundsError,
  UserRejectedRequestError
} from "viem";

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
      console.log('insufficientFundsError', insufficientFundsError)
      message = 'Insufficient Fund'
    } else if (userRejectedRequestError instanceof UserRejectedRequestError) {
      console.log('userRejectedRequestError', userRejectedRequestError)
      message = userRejectedRequestError.shortMessage
    } else if (revertError instanceof ContractFunctionRevertedError) {
      console.log('revertError', revertError)
      message = revertError.reason || revertError.shortMessage || revertError.message
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