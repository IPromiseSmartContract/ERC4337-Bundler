import { UserOperation } from '../../model/userOperation'
import { SendBundleReturn } from '../../model/bundle'

export interface IExecutionManager {
    sendUserOperation(
        userOp: UserOperation,
        entryPointInput: string
    ): Promise<void>
    attemptBundle(): Promise<SendBundleReturn | undefined>
}
