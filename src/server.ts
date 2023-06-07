import bodyParser from 'body-parser'
import cors from 'cors'
import express, { Express, Response, Request } from 'express'
import Debug from 'debug'
import { IUserOpInterface } from './interfaces/handler/userOpInterface'
import { UserOpHandler } from './handler/userOpHandler'

const debug = Debug('aa.bundler.server')

export class BundlerServer {
    app: Express
    private readonly handler: IUserOpInterface

    constructor(handler: UserOpHandler) {
        this.handler = handler

        this.app = express()
        this.app.use(cors())
        this.app.use(bodyParser.json())

        this.app.get('/', this.intro.bind(this))
        this.app.post('/', this.intro.bind(this))
        this.app.post('/rpc', this.rpc.bind(this))
    }

    async intro(req: Request, res: Response): Promise<void> {
        res.send('Account Abstraction Bundler - RPC Server')
    }

    async rpc(req: Request, res: Response): Promise<void> {
        const { method, params, jsonrpc, id } = req.body
        debug('RPC Request', { jsonrpc, id, method, params })
    }
    async handleMethod(method: string, params: any[]): Promise<any> {
        let result: any
        switch (method) {
            case 'eth_chainId':
                // Get the chain ID from provider
                break
            case 'eth_supportedEntryPoints':
                // Get supported entry points from userOpInterface
                break
            case 'eth_sendUserOperation':
                // Call Send user operation in userOpInterface
                await this.handler.sendUserOperation(params[0], params[1])
                break
            case 'eth_estimateUserOperationGas':
                await this.handler.estimateUserOperationGas(
                    params[0],
                    params[1]
                )
                // Call Estimate user operation gas in userOpInterface
                break
            case 'eth_getUserOperationReceipt':
                await this.handler.getUserOperationReceipt(params[0])
                // Call Get user operation receipt in userOpInterface
                break
            case 'eth_getUserOperationByHash':
                // Call Get user operation by hash in userOpInterface
                await this.handler.getUserOperationByHash(params[0])
                break
            case 'web3_clientVersion':
                break
            case 'debug_bundler_clearState':
                break
            case 'debug_bundler_dumpMempool':
                break
            case 'debug_bundler_setReputation':
                break
            case 'debug_bundler_dumpReputation':
                break
            case 'debug_bundler_setBundlingMode':
                break
            case 'debug_bundler_setBundleInterval':
                break
            case 'debug_bundler_sendBundleNow':
                break
            default:
                console.error('Unknown method', method)
        }
        return result
    }
}
