import { Role } from './role.entity';
import { UserProfile } from './user-profile.entity';

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public passwordHash: string,
    public isActive: boolean,
    public profile: UserProfile,
    public roles: Role[] = [],
  ) {}

  updateProfile(profile: UserProfile): void {
    this.profile = profile;
  }

  deactivate(): void {
    this.isActive = false;
  }

  assignRole(role: Role): void {
    const exists = this.roles.some((r) => r.name === role.name);
    if (!exists) this.roles.push(role);
  }

  removeRole(roleName: string): void {
    this.roles = this.roles.filter((r) => r.name !== roleName);
  }
}
