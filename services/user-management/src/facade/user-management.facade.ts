import { Injectable } from '@nestjs/common';
import { Authenticator } from '../services/authenticaton.service';
import { ProfileService } from '../services/profile.service';
import { RoleService } from '../services/role.service';
import { SessionService } from '../services/session.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateProfileDto } from '../dtos/update-profile.dto';
import { LoginDto } from '../dtos/login.dto';

@Injectable()
export class UserManagementFacade {
  constructor(
    private readonly authenticator: Authenticator,
    private readonly profileService: ProfileService,
    private readonly roleService: RoleService,
    private readonly sessionService: SessionService,
  ) {}

  login(dto: LoginDto) {
    return this.authenticator.login(dto);
  }

  createUser(dto: CreateUserDto) {
    return this.profileService.createUser(dto);
  }

  getUserById(userId: string) {
    return this.profileService.getUserById(userId);
  }

  updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.profileService.updateProfile(userId, dto);
  }

  deactivateUser(userId: string) {
    return this.profileService.deactivateUser(userId);
  }

  assignRole(userId: string, roleName: string) {
    return this.roleService.assignRole(userId, roleName);
  }

  removeRole(userId: string, roleName: string) {
    return this.roleService.removeRole(userId, roleName);
  }

  revokeAllSessions(userId: string) {
    return this.sessionService.revokeAll(userId);
  }
}