// controllers/role.controller.ts

import { Body, Controller, Delete, Inject, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { ROLE_SERVICE } from '../constants/injection-tokens';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { RemoveRoleDto } from '../dtos/remove-role.dto';

import { IRoleController } from './interfaces/role.controller.interface';
import * as roleServiceInterface from '../services/interfaces/role.service.interface';

@ApiTags('roles')
@Controller('users/:id/roles')
export class RoleControllerImpl implements IRoleController {
  constructor(
    @Inject(ROLE_SERVICE)
    private readonly roleService: roleServiceInterface.IRoleService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 201, description: 'Role assigned' })
  assign(
    @Param('id') userId: string,
    @Body() dto: AssignRoleDto,
  ): Promise<void> {
    return this.roleService.assignRole(userId, dto.roleName);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: RemoveRoleDto })
  @ApiResponse({ status: 200, description: 'Role removed' })
  remove(
    @Param('id') userId: string,
    @Body() dto: RemoveRoleDto,
  ): Promise<void> {
    return this.roleService.removeRole(userId, dto.roleName);
  }
}
