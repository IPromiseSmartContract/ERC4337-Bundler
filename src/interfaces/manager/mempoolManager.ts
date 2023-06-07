import { BigNumberish } from 'ethers'
import { UserOperation } from '../../model/userOperation'
import { StakeInfo } from '../../model/stake'
import { ReferencedCodeHashes } from '../../model/codeHashes'

export interface Dumpable {
    dump(): UserOperation[]
}

export interface IMempoolManager {
    /**
     * add userOp into mempool, after initial validation.
     * @param userOp
     * @param userOpHash
     * @param prefund
     * @param senderInfo
     * @param refCodeHashes
     * @param aggregator
     */
    addUserOp(
        userOp: UserOperation,
        userOpHash: string,
        prefund: BigNumberish,
        senderInfo: StakeInfo,
        refCodeHashes: ReferencedCodeHashes,
        aggregator?: string
    ): void

    /**
     * remove userOp from mempool if
     * 1. userOp is invalid
     * 2. userOp has already included in a block
     * @param userOpOrHash
     */
    removeUserOp(userOpOrHash: UserOperation | string): void
}
