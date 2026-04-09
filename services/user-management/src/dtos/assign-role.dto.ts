import { IsString } from 'class-validator';

export class AssignRoleDto {
  @IsString()
  roleName!: string;
}
