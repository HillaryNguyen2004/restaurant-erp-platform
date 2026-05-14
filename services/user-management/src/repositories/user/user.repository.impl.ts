import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { Role } from '../../domains/entities/role.entity';
import { IUserRepository } from './user.repository.interface';
import { User } from '../../domains/entities/user.entity';
import { UserProfile } from '../../domains/entities/user-profile.entity';

@Injectable()
export class UserRepositoryImpl
  implements IUserRepository, OnModuleInit, OnModuleDestroy
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
      CREATE TABLE IF NOT EXISTS ${this.schema}.users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        is_active BOOLEAN NOT NULL,
        full_name TEXT NOT NULL,
        phone TEXT,
        avatar_url TEXT
      )
    `);
      await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.roles (
        name TEXT PRIMARY KEY
      )
    `);
      await client.query(`
      CREATE TABLE IF NOT EXISTS ${this.schema}.user_roles (
        user_id TEXT NOT NULL REFERENCES ${this.schema}.users(id) ON DELETE CASCADE,
        role_name TEXT NOT NULL REFERENCES ${this.schema}.roles(name),
        PRIMARY KEY (user_id, role_name)
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

  async findById(id: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, email, password_hash, is_active, full_name, phone, avatar_url
       FROM ${this.schema}.users
       WHERE id = $1`,
      [id],
    );

    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const result = await this.pool.query(
      `SELECT id, email, password_hash, is_active, full_name, phone, avatar_url
       FROM ${this.schema}.users
       WHERE email = $1`,
      [email],
    );

    return result.rows[0] ? this.toUser(result.rows[0]) : null;
  }

  async save(user: User): Promise<void> {
    await this.persist(user);
  }

  async update(user: User): Promise<void> {
    await this.persist(user);
  }

  private async persist(user: User): Promise<void> {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `INSERT INTO ${this.schema}.users (
          id, email, password_hash, is_active, full_name, phone, avatar_url
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          email = EXCLUDED.email,
          password_hash = EXCLUDED.password_hash,
          is_active = EXCLUDED.is_active,
          full_name = EXCLUDED.full_name,
          phone = EXCLUDED.phone,
          avatar_url = EXCLUDED.avatar_url`,
        [
          user.id,
          user.email,
          user.passwordHash,
          user.isActive,
          user.profile.fullName,
          user.profile.phone ?? null,
          user.profile.avatarUrl ?? null,
        ],
      );
      await client.query(`DELETE FROM ${this.schema}.user_roles WHERE user_id = $1`, [
        user.id,
      ]);
      for (const role of user.roles) {
        await client.query(
          `INSERT INTO ${this.schema}.roles (name)
           VALUES ($1)
           ON CONFLICT (name) DO NOTHING`,
          [role.name],
        );
        await client.query(
          `INSERT INTO ${this.schema}.user_roles (user_id, role_name)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [user.id, role.name],
        );
      }
      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  private async toUser(row: Record<string, unknown>): Promise<User> {
    const roles = await this.pool.query(
      `SELECT role_name
       FROM ${this.schema}.user_roles
       WHERE user_id = $1
       ORDER BY role_name`,
      [row.id],
    );

    return new User(
      row.id as string,
      row.email as string,
      row.password_hash as string,
      row.is_active as boolean,
      new UserProfile(
        row.full_name as string,
        (row.phone as string | null) ?? undefined,
        (row.avatar_url as string | null) ?? undefined,
      ),
      roles.rows.map((roleRow) => new Role(roleRow.role_name as string)),
    );
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
