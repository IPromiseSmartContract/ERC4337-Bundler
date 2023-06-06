import {
    UserOperationByHashResponse,
    UserOperationReceipt,
} from '../model/userOperation'
import {
    UserOperationStruct,
    UserOperationEventEvent,
} from '../contracts/Entrypoint'
import { BigNumber } from 'ethers'
import { UserOpInterface } from '../interfaces/userOpInterface'
import { Entrypoint } from '../contracts'
import {
    requireCond,
    RpcError,
    deepHexlify,
    calcPreVerificationGas,
} from '../utils/utils'
import { resolveProperties } from '@ethersproject/properties'
import { BaseProvider } from '@ethersproject/providers'

const HEX_REGEX = /^0x[a-fA-F\d]*$/i

export class UserOpHandler implements UserOpInterface {
    constructor(
        readonly entryPoint: Entrypoint,
        readonly provider: BaseProvider
    ) {
        this.entryPoint = entryPoint
        this.provider = provider
    }
    validateParameters(
        userOp: UserOperationStruct,
        entryPointInput: string,
        requireSignature: boolean,
        requireGasParams: boolean
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    async estimateUserOperationGas(
        userOpInput: UserOperationStruct,
        entryPointInput: string
    ): Promise<any> {
        const userOp = {
            ...(await resolveProperties(userOpInput)),
            paymasterAndData: '0x',
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 0,
            preverificationGas: 0,
            verificationGasLimit: 10e6,
        }
        const errorResult = await this.entryPoint.callStatic
            .simulateValidation(userOp)
            .catch((e) => e)
        if (errorResult.errorName === 'FailedOp') {
            throw new RpcError('Failed to simulate user operation')
        }
        const { returnInfo } = errorResult.errorArgs
        let { preOpGas, validAfter, validUntil } = returnInfo
        // TODO: should validate parameters
        const callGasLimit = await this.provider
            .estimateGas({
                from: this.entryPoint.address,
                to: userOp.sender,
                data: userOp.callData,
            })
            .then((v) => v.toNumber())
            .catch((err) => {
                const message =
                    err.message.match(/reason="(.*?)"/)?.at(1) ??
                    'execution reverted'
                throw new RpcError(message)
            })
        validAfter = BigNumber.from(validAfter)
        validUntil = BigNumber.from(validUntil)
        if (validUntil === BigNumber.from(0)) {
            validUntil = undefined
        }
        if (validAfter === BigNumber.from(0)) {
            validAfter = undefined
        }
        const preVerificationGas = calcPreVerificationGas(userOp)
        const verificationGas = BigNumber.from(preOpGas).toNumber()
        return {
            preVerificationGas,
            verificationGas,
            validAfter,
            validUntil,
            callGasLimit,
        }
    }
    sendUserOperation(
        userOp1: UserOperationStruct,
        entryPointInput: string
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    async getOperationEvent(
        userOpHash: string
    ): Promise<UserOperationEventEvent> {
        // TODO: eth_getLogs is throttled. must be acceptable for finding a UserOperationStruct by hash
        const event = await this.entryPoint.queryFilter(
            this.entryPoint.filters.UserOperationEvent(userOpHash)
        )
        return event[0]
        throw new Error('Method not implemented.')
    }

    async getUserOperationByHash(
        userOpHash: string
    ): Promise<UserOperationByHashResponse> {
        requireCond(
            userOpHash?.toString()?.match(HEX_REGEX) != null,
            'Missing/invalid userOpHash',
            -32601
        )
        const event = await this.getOperationEvent(userOpHash)
        if (event == null) {
            return null
        }
        const tx = await event.getTransaction()
        if (tx.to !== this.entryPoint.address) {
            throw new Error('unable to parse transaction')
        }
        const parsed = this.entryPoint.interface.parseTransaction(tx)
        const ops: UserOperationStruct[] = parsed?.args.ops
        if (ops == null) {
            throw new Error('failed to parse transaction')
        }
        const op = ops.find(
            (op) =>
                op.sender === event.args.sender &&
                BigNumber.from(op.nonce).eq(event.args.nonce)
        )
        if (op == null) {
            throw new Error('unable to find userOp in transaction')
        }

        const {
            sender,
            nonce,
            initCode,
            callData,
            callGasLimit,
            verificationGasLimit,
            preVerificationGas,
            maxFeePerGas,
            maxPriorityFeePerGas,
            paymasterAndData,
            signature,
        } = op

        return deepHexlify({
            userOperation: {
                sender,
                nonce,
                initCode,
                callData,
                callGasLimit,
                verificationGasLimit,
                preVerificationGas,
                maxFeePerGas,
                maxPriorityFeePerGas,
                paymasterAndData,
                signature,
            },
            entryPoint: this.entryPoint.address,
            transactionHash: tx.hash,
            blockHash: tx.blockHash ?? '',
            blockNumber: tx.blockNumber ?? 0,
        })
        throw new Error('Method not implemented.')
    }
    getUserOperationReceipt(userOpHash: string): Promise<UserOperationReceipt> {
        throw new Error('Method not implemented.')
    }
}
