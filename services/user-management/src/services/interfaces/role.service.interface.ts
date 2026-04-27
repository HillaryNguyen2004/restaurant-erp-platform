// services/interfaces/role-service.interface.ts

export interface IRoleService {
  assignRole(userId: string, roleName: string): Promise<void>;
  removeRole(userId: string, roleName: string): Promise<void>;
}
