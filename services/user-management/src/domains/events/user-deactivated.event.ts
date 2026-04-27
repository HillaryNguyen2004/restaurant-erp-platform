import { randomUUID } from 'crypto';
import { User } from '../entities/user.entity';
import { DomainEvent } from './domain.event';

export class UserDeactivatedEvent extends DomainEvent {
  readonly eventType = 'user.deactivated';

  constructor(private readonly user: User) {
    super(randomUUID(), new Date());
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.user.id,
      email: this.user.email,
    };
  }
}
