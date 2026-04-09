import { Role } from '../../domains/entities/role.entity';

export interface IRoleRepository {
  findByName(name: string): Promise<Role | null>;
}
