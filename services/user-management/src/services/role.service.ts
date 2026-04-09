import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import * as userRepositoryInterface from '../repositories/user/user.repository.interface';
import * as roleRepositoryInterface from '../repositories/role/role.repository.interface';
import * as eventPublisherInterface from '../ports/event-publisher.interface';
import {
  EVENT_PUBLISHER,
  ROLE_REPOSITORY,
  USER_REPOSITORY,
} from '../constants/injection-tokens';
import { RoleAssignedEvent } from '../domains/events/role-assigned.event';
import { RoleRemovedEvent } from '../domains/events/role-removed.event';

@Injectable()
export class RoleService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepositoryInterface.IUserRepository,
    @Inject(ROLE_REPOSITORY)
    private readonly roleRepo: roleRepositoryInterface.IRoleRepository,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: eventPublisherInterface.IEventPublisher,
  ) {}

  async assignRole(userId: string, roleName: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findByName(roleName);
    if (!role) throw new NotFoundException('Role not found');

    user.assignRole(role);

    await this.userRepo.update(user);
    await this.eventPublisher.publish(new RoleAssignedEvent(user, role));
  }

  async removeRole(userId: string, roleName: string): Promise<void> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    const role = await this.roleRepo.findByName(roleName);
    if (!role) throw new NotFoundException('Role not found');

    user.removeRole(roleName);

    await this.userRepo.update(user);
    await this.eventPublisher.publish(new RoleRemovedEvent(user, role));
  }
}
