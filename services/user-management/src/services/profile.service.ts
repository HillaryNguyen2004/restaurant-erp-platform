import { randomUUID } from 'crypto';
import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as userRepositoryInterface from '../repositories/user/user.repository.interface';
import * as passwordHasherInterface from '../ports/password-hasher.interface';
import * as eventPublisherInterface from '../ports/event-publisher.interface';
import {
  EVENT_PUBLISHER,
  PASSWORD_HASHER,
  USER_REPOSITORY,
} from '../constants/injection-tokens';
import { User } from '../domains/entities/user.entity';
import { UserProfile } from '../domains/entities/user-profile.entity';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { UserCreatedEvent } from '../domains/events/user-created.event';
import { UserUpdatedEvent } from '../domains/events/user-updated.event';
import { UserDeactivatedEvent } from '../domains/events/user-deactivated.event';

@Injectable()
export class ProfileService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepo: userRepositoryInterface.IUserRepository,
    @Inject(PASSWORD_HASHER)
    private readonly hasher: passwordHasherInterface.IPasswordHasher,
    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: eventPublisherInterface.IEventPublisher,
  ) {}

  async createUser(dto: CreateUserDto): Promise<User> {
    const existing = await this.userRepo.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already exists');
    }

    const passwordHash = await this.hasher.hash(dto.password);

    const user = new User(
      randomUUID(),
      dto.email,
      passwordHash,
      true,
      new UserProfile(dto.fullName, dto.phone, dto.avatarUrl),
      [],
    );

    await this.userRepo.save(user);
    await this.eventPublisher.publish(new UserCreatedEvent(user));

    return user;
  }

  async getUserById(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<User> {
    const user = await this.getUserById(userId);

    const updatedProfile = new UserProfile(
      dto.fullName ?? user.profile.fullName,
      dto.phone ?? user.profile.phone,
      dto.avatarUrl ?? user.profile.avatarUrl,
    );

    user.updateProfile(updatedProfile);

    await this.userRepo.update(user);
    await this.eventPublisher.publish(new UserUpdatedEvent(user));

    return user;
  }

  async deactivateUser(userId: string): Promise<void> {
    const user = await this.getUserById(userId);

    user.deactivate();

    await this.userRepo.update(user);
    await this.eventPublisher.publish(new UserDeactivatedEvent(user));
  }
}
