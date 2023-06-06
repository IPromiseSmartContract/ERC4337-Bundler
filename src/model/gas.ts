export interface GasOverheads {
    /*
    Reference: 
    https://github.com/eth-infinitism/bundler/blob/a1cab449a45c991215648fe77b10148cc6466d62/packages/sdk/src/calcPreVerificationGas.ts#L5-L42
    */
    fixed: number // fixed overhead for entire handleOp bundle (21000)
    perUserOp: number
    perUserOpWord: number
    zeroByte: number
    nonZeroByte: number
    bundleSize: number
    sigSize: number
}
