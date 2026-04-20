import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UserManagementFacade } from '../facade/user-management.facade';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { RemoveRoleDto } from '../dtos/remove-role.dto';

@ApiTags('roles')
@Controller('users/:id/roles')
export class RoleController {
  constructor(private readonly facade: UserManagementFacade) {}

  @Post()
  @ApiOperation({ summary: 'Assign a role to a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: AssignRoleDto })
  @ApiResponse({ status: 201, description: 'Role assigned' })
  assign(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.facade.assignRole(userId, dto.roleName);
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a role from a user' })
  @ApiParam({ name: 'id', type: String })
  @ApiBody({ type: RemoveRoleDto })
  @ApiResponse({ status: 200, description: 'Role removed' })
  remove(@Param('id') userId: string, @Body() dto: RemoveRoleDto) {
    return this.facade.removeRole(userId, dto.roleName);
  }
}
