import { hexlify, resolveProperties } from 'ethers/lib/utils'

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
