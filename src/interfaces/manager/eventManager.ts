import {
    AccountDeployedEvent,
    SignatureAggregatorChangedEvent,
    UserOperationEventEvent
} from '../../contracts/Entrypoint'

export interface IEventManager {
    _initEventListener(): void
    _handleUserOperationEvent(event: UserOperationEventEvent): void
    _handleAccountDeployedEvent(event: AccountDeployedEvent): void
    _handleAggregatorChangedEvent(event: SignatureAggregatorChangedEvent): void
    handleEvent(
        event:
            | UserOperationEventEvent
            | AccountDeployedEvent
            | SignatureAggregatorChangedEvent
    ): void
}
