import {
    UserOperation,
    UserOperationEventEvent,
    UserOperationByHashResponse,
    UserOperationReceipt
} from '../../model/userOperation'
export interface IUserOpInterface {
    validateParameters(
        userOp: UserOperation,
        entryPointInput: string,
        requireSignature: boolean,
        requireGasParams: boolean
    ): Promise<boolean>
    estimateUserOperationGas(
        userOp: UserOperation,
        entryPointInput: string
    ): Promise<any>
    sendUserOperation(
        userOp1: UserOperation,
        entryPointInput: string
    ): Promise<string>
    getOperationEvent(userOpHash: string): Promise<UserOperationEventEvent>
    getUserOperationByHash(
        userOpHash: string
    ): Promise<UserOperationByHashResponse | null>
    getUserOperationReceipt(
        userOpHash: string
    ): Promise<UserOperationReceipt | null>
}
