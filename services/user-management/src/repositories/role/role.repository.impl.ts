import { Injectable } from '@nestjs/common';
import { IRoleRepository } from './role.repository.interface';
import { Role } from '../../domains/entities/role.entity';

@Injectable()
export class RoleRepositoryImpl implements IRoleRepository {
  private readonly roles = [
    new Role('ADMIN'),
    new Role('MANAGER'),
    new Role('SERVER'),
    new Role('CHEF'),
    new Role('CASHIER'),
  ];
  findByName(name: string): Promise<Role | null> {
    return Promise.resolve(this.roles.find((r) => r.name === name) ?? null);
  }
}
