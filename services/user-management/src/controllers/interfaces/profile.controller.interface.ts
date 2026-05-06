// controllers/profile.controller.interface.ts

import { CreateUserDto } from '../../dtos/create-user.dto';
import { UpdateProfileDto } from '../../dtos/update-profile.dto';
import { User } from '../../domains/entities/user.entity';

export interface IProfileController {
  create(dto: CreateUserDto): Promise<User>;
  getById(id: string): Promise<User>;
  update(id: string, dto: UpdateProfileDto): Promise<User>;
  deactivate(id: string): Promise<void>;
  revokeSessions(id: string): Promise<void>;
}
