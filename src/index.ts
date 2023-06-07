import { ethers, BigNumber } from 'ethers'
import { Entrypoint__factory } from './contracts'
import { UserOpHandler } from './handler/userOpHandler'
import { BundlerServer } from './server'
import { ExecutionManager } from './modules/ExecutionManager'
import { MempoolManager } from './modules/MempoolManager'
import { ReputationManager } from './modules/ReputationManager'
import { BundlerReputationParams } from './modules/ReputationManager'
import { BundleManager } from './modules/BundleManager'
import { EventsManager } from './modules/EventsManager'
import { ValidationManager } from './modules/ValidationManager'
import { config as envConfig } from 'dotenv'
envConfig()

// Get constant from environment
const SEPOLIA_URL = process.env.SEPOLIA_URL!
const SEPOLIA_PRIVATE_KEYS = process.env.SEPOLIA_PRIVATE_KEYS!
const ENTRYPOINT_ADDRESS = process.env.ENTRYPOINT_ADDRESS!
const beneficiary = process.env.BENEFICIARY!

// Create provider and signer
const provider = new ethers.providers.JsonRpcProvider(SEPOLIA_URL)
const signer = new ethers.Wallet(SEPOLIA_PRIVATE_KEYS!, provider)

// Connect on chain contracts
const entryPoint = Entrypoint__factory.connect(ENTRYPOINT_ADDRESS, signer)

// Create Manager instances
const reputationManager = new ReputationManager(
    BundlerReputationParams,
    ethers.utils.parseEther('0.0001'),
    10
)
const memPoolManager = new MempoolManager(reputationManager)
const eventManager = new EventsManager(entryPoint, memPoolManager, reputationManager)
const validationManager = new ValidationManager(entryPoint, reputationManager, true)
const bundleManager = new BundleManager(
    entryPoint,
    eventManager,
    memPoolManager,
    validationManager,
    reputationManager,
    beneficiary,
    ethers.utils.parseEther('0.01'), // minSignerBalance
    3e8, // MaxBundleGas
    true,
    true
)
const execManager = new ExecutionManager(
    reputationManager,
    memPoolManager,
    bundleManager,
    validationManager
)

// Create handler
const userOpHandler = new UserOpHandler(entryPoint, provider, execManager)

// Create server
const server = new BundlerServer(userOpHandler)
server.app.listen(3000)
