// controllers/role.controller.interface.ts

import { AssignRoleDto } from '../../dtos/assign-role.dto';
import { RemoveRoleDto } from '../../dtos/remove-role.dto';

export interface IRoleController {
  assign(userId: string, dto: AssignRoleDto): Promise<void>;
  remove(userId: string, dto: RemoveRoleDto): Promise<void>;
}
