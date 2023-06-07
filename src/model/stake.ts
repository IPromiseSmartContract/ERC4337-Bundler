import { BigNumberish } from 'ethers'

export interface StakeInfo {
    address: string
    stake: BigNumberish
    unstakeDelaySec: BigNumberish
}
