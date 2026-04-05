import { randomUUID } from 'crypto';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { DomainEvent } from './domain-event';

export class RoleRemovedEvent extends DomainEvent {
  readonly eventType = 'role.removed';

  constructor(
    private readonly user: User,
    private readonly role: Role,
  ) {
    super(randomUUID(), new Date());
  }

  toPayload(): Record<string, unknown> {
    return {
      userId: this.user.id,
      role: this.role.name,
    };
  }
}