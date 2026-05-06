import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class AssignRoleDto {
  @ApiProperty({ example: 'CHEF' })
  @IsString()
  roleName!: string;
}
