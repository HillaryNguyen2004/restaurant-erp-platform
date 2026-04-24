import { CreateUserDto } from '../../dtos/create-user.dto';

import { UpdateProfileDto } from '../../dtos/update-profile.dto';

import { User } from '../../domains/entities/user.entity';

export interface IProfileService {
  createUser(dto: CreateUserDto): Promise<User>;

  getUserById(userId: string): Promise<User>;

  updateProfile(userId: string, dto: UpdateProfileDto): Promise<User>;

  deactivateUser(userId: string): Promise<void>;
}
