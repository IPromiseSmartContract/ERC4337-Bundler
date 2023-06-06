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
import { requireCond, RpcError, deepHexlify, tostr } from '../utils/utils'
//import { BundlerConfig } from '../modules/BundlerConfig'
import { resolveProperties } from '@ethersproject/properties'
import { ExecutionManager } from '../modules/ExecutionManager'
const HEX_REGEX = /^0x[a-fA-F\d]*$/i

export class UserOpHandler implements UserOpInterface {
    constructor(
        readonly execManager: ExecutionManager,
        readonly entryPoint: Entrypoint
    ) //readonly config: BundlerConfig
    {}
    async validateParameters(
        userOp1: UserOperationStruct,
        entryPointInput: string,
        requireSignature = true,
        requireGasParams = true
    ): Promise<boolean> {
        requireCond(entryPointInput != null, 'No entryPoint param', -32602)

        // if (
        //     entryPointInput?.toString().toLowerCase() !==
        //     this.config.entryPoint.toLowerCase()
        // ) {
        //     throw new Error(
        //         `The EntryPoint at "${entryPointInput}" is not supported. This bundler uses ${this.config.entryPoint}`
        //     )
        // }
        // minimal sanity check: userOp exists, and all members are hex
        requireCond(userOp1 != null, 'No UserOperation param')
        const userOp = (await resolveProperties(userOp1)) as any

        const fields = [
            'sender',
            'nonce',
            'initCode',
            'callData',
            'paymasterAndData',
        ]
        if (requireSignature) {
            fields.push('signature')
        }
        if (requireGasParams) {
            fields.push(
                'preVerificationGas',
                'verificationGasLimit',
                'callGasLimit',
                'maxFeePerGas',
                'maxPriorityFeePerGas'
            )
        }
        fields.forEach((key) => {
            requireCond(
                userOp[key] != null,
                'Missing userOp field: ' + key + JSON.stringify(userOp),
                -32602
            )
            const value: string = userOp[key].toString()
            requireCond(
                value.match(HEX_REGEX) != null,
                `Invalid hex value for property ${key}:${value} in UserOp`,
                -32602
            )
        })
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
    async sendUserOperation(
        userOp1: UserOperationStruct,
        entryPointInput: string
    ): Promise<string> {
        await this.validateParameters(userOp1, entryPointInput)

        const userOp = await resolveProperties(userOp1)
        /*
        console.log(
            `UserOperation: Sender=${userOp.sender}  Nonce=${tostr(
                userOp.nonce
            )} EntryPoint=${entryPointInput} Paymaster=${getAddr(
                userOp.paymasterAndData
            )}`
        )
        */
        await this.execManager.sendUserOperation(userOp, entryPointInput)
        return await this.entryPoint.getUserOpHash(userOp)
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
