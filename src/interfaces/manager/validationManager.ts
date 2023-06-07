import { ValidationResult } from '../../model/validation'
import { ReferencedCodeHashes } from '../../model/codeHashes'
import { UserOperation } from '../../model/userOperation'
import { ValidateUserOpResult } from '../../model/validation'

export interface IValidationManager {
    inputParamValidation(userOp: UserOperation, entryPointInput: string): void
    simulateValidation(userOp: UserOperation): Promise<ValidationResult>
    validateUserOp(
        userOp: UserOperation,
        previousCodeHashes?: ReferencedCodeHashes
    ): Promise<ValidateUserOpResult>
}
