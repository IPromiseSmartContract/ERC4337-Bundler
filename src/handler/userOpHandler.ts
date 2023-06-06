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
    estimateUserOperationGas(
        userOp: UserOperation,
        entryPoint: string
    ): Promise<any> {
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
