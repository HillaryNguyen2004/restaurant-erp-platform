import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { IRoleRepository } from './role.repository.interface';
import { Role } from '../../domains/entities/role.entity';

@Injectable()
export class RoleRepositoryImpl
  implements IRoleRepository, OnModuleInit, OnModuleDestroy
{
  private readonly pool = new Pool({
    connectionString:
      process.env.DATABASE_URL ??
      'postgresql://postgres:mysecretpassword@localhost:5432/irms_db',
  });
  private readonly schema = this.safeSchema(
    process.env.DATABASE_SCHEMA ?? 'user_management',
  );

  async onModuleInit(): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query(
        `SELECT pg_advisory_lock(hashtext('user_management_schema_init'))`,
      );
      await this.ensureSchema(client);
      await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.roles (
        name TEXT PRIMARY KEY
      )
    `);
      await client.query(
      `INSERT INTO ${this.schema}.roles (name)
       VALUES ('ADMIN'), ('MANAGER'), ('SERVER'), ('CHEF'), ('CASHIER')
       ON CONFLICT (name) DO NOTHING`,
      );
    } finally {
      await client.query(
        `SELECT pg_advisory_unlock(hashtext('user_management_schema_init'))`,
      );
      client.release();
    }
  }

  async onModuleDestroy(): Promise<void> {
    await this.pool.end();
  }

  async findByName(name: string): Promise<Role | null> {
    const result = await this.pool.query(
      `SELECT name FROM ${this.schema}.roles WHERE name = $1`,
      [name],
    );

    return result.rows[0] ? new Role(result.rows[0].name as string) : null;
  }

  private safeSchema(schema: string): string {
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(schema)) {
      throw new Error(`Invalid PostgreSQL schema name: ${schema}`);
    }

    return schema;
  }

  private async ensureSchema(client: Pool | PoolClient = this.pool): Promise<void> {
    try {
      await client.query(`CREATE SCHEMA IF NOT EXISTS ${this.schema}`);
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error.code === '42P06' || error.code === '23505')
      ) {
        return;
      }

      throw error;
    }
  }
}
