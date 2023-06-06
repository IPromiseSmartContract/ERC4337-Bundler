import { BigNumberish } from 'ethers'
import { TransactionReceipt } from '@ethersproject/providers'
/**
 * RPC calls return types
 */

export interface EstimateUserOpGasResult {
    preVerificationGas: BigNumberish
    verificationGas: BigNumberish
    deadline?: BigNumberish
    callGasLimit: BigNumberish
}
