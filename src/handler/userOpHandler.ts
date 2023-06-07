import {
    UserOperationByHashResponse,
    UserOperationReceipt
} from '../model/userOperation'
import {
    UserOperationStruct,
    UserOperationEventEvent
} from '../contracts/Entrypoint'
import { Log } from '@ethersproject/providers'
import { BigNumber } from 'ethers'
import { IUserOpInterface } from '../interfaces/handler/userOpInterface'
import { Entrypoint } from '../contracts'
import {
    requireCond,
    RpcError,
    deepHexlify,
    calcPreVerificationGas,
    tostr
} from '../utils/utils'
import { resolveProperties } from '@ethersproject/properties'
import { BaseProvider } from '@ethersproject/providers'

import { ExecutionManager } from '../modules/ExecutionManager'
const HEX_REGEX = /^0x[a-fA-F\d]*$/i

export class UserOpHandler implements IUserOpInterface {
    constructor(
        readonly entryPoint: Entrypoint,
        readonly provider: BaseProvider,
        readonly execManager: ExecutionManager
    ) {
        this.entryPoint = entryPoint
        this.provider = provider
        this.execManager = execManager
    }

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
            'paymasterAndData'
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
        userOpInput: UserOperationStruct,
        entryPointInput: string
    ): Promise<any> {
        const userOp = {
            ...(await resolveProperties(userOpInput)),
            paymasterAndData: '0x',
            maxFeePerGas: 0,
            maxPriorityFeePerGas: 0,
            preverificationGas: 0,
            verificationGasLimit: 10e6
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
                data: userOp.callData
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
            callGasLimit
        }
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
            signature
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
                signature
            },
            entryPoint: this.entryPoint.address,
            transactionHash: tx.hash,
            blockHash: tx.blockHash ?? '',
            blockNumber: tx.blockNumber ?? 0
        })
    }

    _filterLogs(userOpEvent: UserOperationEventEvent, logs: Log[]): Log[] {
        let startIndex = -1
        let endIndex = -1
        const events = Object.values(this.entryPoint.interface.events)
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const beforeExecutionTopic = this.entryPoint.interface.getEventTopic(
            events.find((e) => e.name === 'BeforeExecution')!
        )
        logs.forEach((log, index) => {
            if (log?.topics[0] === beforeExecutionTopic) {
                // all UserOp execution events start after the "BeforeExecution" event.
                startIndex = endIndex = index
            } else if (log?.topics[0] === userOpEvent.topics[0]) {
                // process UserOperationEvent
                if (log.topics[1] === userOpEvent.topics[1]) {
                    // it's our userOpHash. save as end of logs array
                    endIndex = index
                } else {
                    // it's a different hash. remember it as beginning index, but only if we didn't find our end index yet.
                    if (endIndex === -1) {
                        startIndex = index
                    }
                }
            }
        })
        if (endIndex === -1) {
            throw new Error('fatal: no UserOperationEvent in logs')
        }
        return logs.slice(startIndex + 1, endIndex)
    }

    async getUserOperationReceipt(
        userOpHash: string
    ): Promise<UserOperationReceipt> {
        requireCond(
            userOpHash?.toString()?.match(HEX_REGEX) != null,
            'Missing/invalid userOpHash',
            -32601
        )
        const event = await this.getOperationEvent(userOpHash)
        if (event == null) {
            return null
        }
        const receipt = await event.getTransactionReceipt()
        const logs = this._filterLogs(event, receipt.logs)
        return deepHexlify({
            userOpHash,
            sender: event.args.sender,
            nonce: event.args.nonce,
            actualGasCost: event.args.actualGasCost,
            actualGasUsed: event.args.actualGasUsed,
            success: event.args.success,
            logs,
            receipt
        })
        throw new Error('Method not implemented.')
    }
}
