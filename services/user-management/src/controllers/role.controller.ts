import { Body, Controller, Delete, Param, Post } from '@nestjs/common';
import { UserManagementFacade } from '../facade/user-management.facade';
import { AssignRoleDto } from '../dtos/assign-role.dto';
import { RemoveRoleDto } from '../dtos/remove-role.dto';

@Controller('users/:id/roles')
export class RoleController {
  constructor(private readonly facade: UserManagementFacade) {}

  @Post()
  assign(@Param('id') userId: string, @Body() dto: AssignRoleDto) {
    return this.facade.assignRole(userId, dto.roleName);
  }

  @Delete()
  remove(@Param('id') userId: string, @Body() dto: RemoveRoleDto) {
    return this.facade.removeRole(userId, dto.roleName);
  }
}
