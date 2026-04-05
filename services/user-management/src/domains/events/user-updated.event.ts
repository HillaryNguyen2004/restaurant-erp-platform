import { randomUUID } from 'crypto';
import { User } from '../entities/user.entity';
import { DomainEvent } from './domain.event';

export class UserUpdatedEvent extends DomainEvent {
  readonly eventType = 'user.updated';

  constructor(private readonly user: User) {
    super(randomUUID(), new Date());
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.user.id,
      fullName: this.user.profile.fullName,
      phone: this.user.profile.phone,
      avatarUrl: this.user.profile.avatarUrl,
    };
  }
}