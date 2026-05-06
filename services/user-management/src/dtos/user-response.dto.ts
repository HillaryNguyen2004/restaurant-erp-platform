import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty()
  isActive!: boolean;

  @ApiProperty()
  profile!: {
    fullName: string;
    phone?: string;
    avatarUrl?: string;
  };

  @ApiProperty({ type: [String] })
  roles!: string[];

  static fromDomain(user: {
    id: string;
    email: string;
    isActive: boolean;
    profile: { fullName: string; phone?: string; avatarUrl?: string };
    roles: { name: string }[];
  }): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      isActive: user.isActive,
      profile: {
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        avatarUrl: user.profile.avatarUrl,
      },
      roles: user.roles.map((r) => r.name),
    };
  }
}
