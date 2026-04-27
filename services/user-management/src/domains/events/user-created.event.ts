import { randomUUID } from 'crypto';
import { User } from '../entities/user.entity';
import { DomainEvent } from './domain.event';

export class UserCreatedEvent extends DomainEvent {
  readonly eventType = 'user.created';

  constructor(private readonly user: User) {
    super(randomUUID(), new Date());
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.user.id,
      email: this.user.email,
      roles: this.user.roles.map((r) => r.name),
    };
  }
}
