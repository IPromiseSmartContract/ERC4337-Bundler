import { hexlify, resolveProperties } from 'ethers/lib/utils'
import { BigNumberish } from 'ethers/lib/ethers'
import { BigNumber } from 'ethers'
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

export type NotPromise<T> = {
    [P in keyof T]: Exclude<T[P], Promise<any>>
}
