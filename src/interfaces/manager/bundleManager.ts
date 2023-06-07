import { SendBundleReturn, StorageMap } from '../../model/bundle'
import { UserOperation } from '../../model/userOperation'

export interface IBundleManager {
    createBundle(): Promise<[UserOperation[], StorageMap]>
    sendBundle(
        userOps: UserOperation[],
        beneficiary: string
    ): Promise<SendBundleReturn | undefined>
}
