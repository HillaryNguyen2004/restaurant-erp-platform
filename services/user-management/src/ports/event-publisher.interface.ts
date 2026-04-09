import { DomainEvent } from '../domains/events/domain.event';

export interface IEventPublisher {
  publish(event: DomainEvent): Promise<void>;
}
