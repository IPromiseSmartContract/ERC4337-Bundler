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
import { requireCond, RpcError, deepHexlify } from '../utils/utils'

const HEX_REGEX = /^0x[a-fA-F\d]*$/i

export class UserOpHandler implements UserOpInterface {
    constructor(readonly entryPoint: Entrypoint) {}
    validateParameters(
        userOp: UserOperationStruct,
        entryPointInput: string,
        requireSignature: boolean,
        requireGasParams: boolean
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    async estimateUserOperationGas(
        userOp1: UserOperationStruct,
        entryPoint: string
    ): Promise<any> {
        const userOp = {
            paymasterAndData: '0x',
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 0,
            preverificationGas: 0,
            verificationGasLimit: 10e6,
        }
        throw new Error('Method not implemented.')
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
