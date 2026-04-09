import { IsString } from 'class-validator';

export class RemoveRoleDto {
  @IsString()
  roleName!: string;
}
