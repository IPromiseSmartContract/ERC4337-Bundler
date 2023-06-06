import {
    UserOperation,
    UserOperationEventEvent,
    UserOperationByHashResponse,
    UserOperationReceipt,
} from '../model/userOperation'
import { UserOpInterface } from '../interfaces/userOpInterface'

export class UserOpHandler implements UserOpInterface {
    constructor() {}
    validateParameters(
        userOp: UserOperation,
        entryPointInput: string,
        requireSignature: boolean,
        requireGasParams: boolean
    ): Promise<boolean> {
        throw new Error('Method not implemented.')
    }
    async estimateUserOperationGas(
        userOp1: UserOperation,
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
        userOp1: UserOperation,
        entryPointInput: string
    ): Promise<string> {
        throw new Error('Method not implemented.')
    }
    getOperationEvent(userOpHash: string): Promise<UserOperationEventEvent> {
        throw new Error('Method not implemented.')
    }
    getUserOperationByHash(
        userOpHash: string
    ): Promise<UserOperationByHashResponse> {
        throw new Error('Method not implemented.')
    }
    getUserOperationReceipt(userOpHash: string): Promise<UserOperationReceipt> {
        throw new Error('Method not implemented.')
    }
}
