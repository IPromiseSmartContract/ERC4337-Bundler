import { BigNumber, BigNumberish, BytesLike } from 'ethers'
import { PromiseOrValue } from './common'

export declare namespace EntryPoint {
    type MemoryUserOpStruct = {
        sender: PromiseOrValue<string>
        nonce: PromiseOrValue<BigNumberish>
        callGasLimit: PromiseOrValue<BigNumberish>
        verificationGasLimit: PromiseOrValue<BigNumberish>
        preVerificationGas: PromiseOrValue<BigNumberish>
        paymaster: PromiseOrValue<string>
        maxFeePerGas: PromiseOrValue<BigNumberish>
        maxPriorityFeePerGas: PromiseOrValue<BigNumberish>
    }
    type MemoryUserOpStructOutput = [
        string,
        BigNumber,
        BigNumber,
        BigNumber,
        BigNumber,
        string,
        BigNumber,
        BigNumber
    ] & {
        sender: string
        nonce: BigNumber
        callGasLimit: BigNumber
        verificationGasLimit: BigNumber
        preVerificationGas: BigNumber
        paymaster: string
        maxFeePerGas: BigNumber
        maxPriorityFeePerGas: BigNumber
    }
    type UserOpInfoStruct = {
        mUserOp: EntryPoint.MemoryUserOpStruct
        userOpHash: PromiseOrValue<BytesLike>
        prefund: PromiseOrValue<BigNumberish>
        contextOffset: PromiseOrValue<BigNumberish>
        preOpGas: PromiseOrValue<BigNumberish>
    }
    type UserOpInfoStructOutput = [
        EntryPoint.MemoryUserOpStructOutput,
        string,
        BigNumber,
        BigNumber,
        BigNumber
    ] & {
        mUserOp: EntryPoint.MemoryUserOpStructOutput
        userOpHash: string
        prefund: BigNumber
        contextOffset: BigNumber
        preOpGas: BigNumber
    }
}
