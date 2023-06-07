import { BigNumberish } from 'ethers'
import { StakeInfo } from './stake'
import { ReferencedCodeHashes } from './codeHashes'
import { StorageMap } from './bundle'

export interface ValidationResult {
    returnInfo: {
        preOpGas: BigNumberish
        prefund: BigNumberish
        sigFailed: boolean
        deadline: number
    }

    senderInfo: StakeInfo
    factoryInfo?: StakeInfo
    paymasterInfo?: StakeInfo
    aggregatorInfo?: StakeInfo
}

export interface ValidateUserOpResult extends ValidationResult {
    referencedContracts: ReferencedCodeHashes
    storageMap: StorageMap
}
