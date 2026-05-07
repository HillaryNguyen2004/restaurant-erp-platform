import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { ISessionRepository } from './session.repository.interface';
import { UserSession } from '../../domains/entities/user-session.entity';

@Injectable()
export class SessionRepositoryImpl
  implements ISessionRepository, OnModuleInit, OnModuleDestroy
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
      CREATE TABLE IF NOT EXISTS ${this.schema}.sessions (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES ${this.schema}.users(id) ON DELETE CASCADE,
        refresh_token TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL,
        is_revoked BOOLEAN NOT NULL
      )
    `);
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

  async save(session: UserSession): Promise<void> {
    await this.pool.query(
      `INSERT INTO ${this.schema}.sessions (
        id, user_id, refresh_token, created_at, is_revoked
      )
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO UPDATE SET
        refresh_token = EXCLUDED.refresh_token,
        created_at = EXCLUDED.created_at,
        is_revoked = EXCLUDED.is_revoked`,
      [
        session.id,
        session.userId,
        session.refreshToken,
        session.createdAt,
        session.isRevoked,
      ],
    );
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    const result = await this.pool.query(
      `SELECT id, user_id, refresh_token, created_at, is_revoked
       FROM ${this.schema}.sessions
       WHERE user_id = $1 AND is_revoked = false
       ORDER BY created_at DESC`,
      [userId],
    );

    return result.rows.map(
      (row) =>
        new UserSession(
          row.id as string,
          row.user_id as string,
          row.refresh_token as string,
          row.created_at as Date,
          row.is_revoked as boolean,
        ),
    );
  }

  async revokeByUserId(userId: string): Promise<void> {
    await this.pool.query(
      `UPDATE ${this.schema}.sessions
       SET is_revoked = true
       WHERE user_id = $1`,
      [userId],
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
