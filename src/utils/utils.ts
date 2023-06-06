import {
    hexlify,
    arrayify,
    resolveProperties,
    keccak256,
    defaultAbiCoder,
} from 'ethers/lib/utils'
import { BigNumberish } from 'ethers/lib/ethers'
import { BigNumber } from 'ethers'
import { UserOperation } from '../modules/Types'
import { GasOverheads } from '../model/gas'
import { UserOperationStruct } from '../contracts/Entrypoint'

export function deepHexlify(obj: any): any {
    if (typeof obj === 'function') {
        return undefined
    }
    if (obj == null || typeof obj === 'string' || typeof obj === 'boolean') {
        return obj
    } else if (obj._isBigNumber != null || typeof obj !== 'object') {
        return hexlify(obj).replace(/^0x0/, '0x')
    }
    if (Array.isArray(obj)) {
        return obj.map((member) => deepHexlify(member))
    }
    return Object.keys(obj).reduce(
        (set, key) => ({
            ...set,
            [key]: deepHexlify(obj[key]),
        }),
        {}
    )
}

// resolve all property and hexlify.
// (UserOpMethodHandler receives data from the network, so we need to pack our generated values)
export async function resolveHexlify(a: any): Promise<any> {
    return deepHexlify(await resolveProperties(a))
}

export class RpcError extends Error {
    // error codes from: https://eips.ethereum.org/EIPS/eip-1474
    constructor(
        msg: string,
        readonly code?: number,
        readonly data: any = undefined
    ) {
        super(msg)
    }
}

export function requireCond(
    cond: boolean,
    msg: string,
    code?: number,
    data: any = undefined
): void {
    if (!cond) {
        throw new RpcError(msg, code, data)
    }
}
export function mapOf<T>(
    keys: Iterable<string>,
    mapper: (key: string) => T,
    filter?: (key: string) => boolean
): { [key: string]: T } {
    const ret: { [key: string]: T } = {}
    for (const key of keys) {
        if (filter == null || filter(key)) {
            ret[key] = mapper(key)
        }
    }
    return ret
}

export function tostr(s: BigNumberish): string {
    return BigNumber.from(s).toString()
}

export const DefaultGasOverheads: GasOverheads = {
    fixed: 21000,
    perUserOp: 18300,
    perUserOpWord: 4,
    zeroByte: 4,
    nonZeroByte: 16,
    bundleSize: 1,
    sigSize: 65,
}

export function packUserOp(op: UserOperation): string {
    return defaultAbiCoder.encode(
        [
            'address',
            'uint256',
            'bytes32',
            'bytes32',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'bytes32',
        ],
        [
            op.sender,
            op.nonce,
            keccak256(op.initCode),
            keccak256(op.callData),
            op.callGasLimit,
            op.verificationGasLimit,
            op.preVerificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            keccak256(op.paymasterAndData),
        ]
    )
}

export function packUserOpWithoutSignature(op: UserOperation): string {
    return defaultAbiCoder.encode(
        [
            'address',
            'uint256',
            'bytes',
            'bytes',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'uint256',
            'bytes',
            'bytes',
        ],
        [
            op.sender,
            op.nonce,
            op.initCode,
            op.callData,
            op.callGasLimit,
            op.verificationGasLimit,
            op.preVerificationGas,
            op.maxFeePerGas,
            op.maxPriorityFeePerGas,
            op.paymasterAndData,
            op.signature,
        ]
    )
}

export function calcPreVerificationGas(
    userOp: Partial<UserOperation>,
    overheads?: Partial<GasOverheads>
): number {
    const ov = { ...DefaultGasOverheads, ...(overheads ?? {}) }
    const p: UserOperationStruct = {
        // dummy values, in case the UserOp is incomplete.
        preVerificationGas: 21000, // dummy value, just for calldata cost
        signature: hexlify(Buffer.alloc(ov.sigSize, 1)), // dummy signature
        ...userOp,
    } as any

    const packed = arrayify(packUserOp(p))
    const lengthInWord = (packed.length + 31) / 32
    const callDataCost = packed
        .map((x) => (x === 0 ? ov.zeroByte : ov.nonZeroByte))
        .reduce((sum, x) => sum + x)
    const ret = Math.round(
        callDataCost +
            ov.fixed / ov.bundleSize +
            ov.perUserOp +
            ov.perUserOpWord * lengthInWord
    )
    return ret
}
