import { BigNumber } from 'ethers'

interface Params {
    sender: string // 發起交易的帳戶
    nonce: BigNumber // 交易ID
    initCode: string // 前20bytes是senderFactory的地址，後面接著其他參數
    callData: string // userOp 實際想要執行的交易與參數
    callGasLimit: BigNumber // 基本費用
    verificationGasLimit: BigNumber
    preVerificationGas: BigNumber // prefundGas = callGasLimit + verificationGasLimit * 3(paymaster != null) + preVerificationGas
    maxFeePerGas: BigNumber
    maxPriorityFeePerGas: BigNumber
    paymasterAndData: string // 前20bytes是paymaster的地址，後面接著20bytes token address
    signature: string // ECDSA交易簽名
}

interface Request {
    method: string
    params: Params
    jsonrpc: string
    id: number
}
