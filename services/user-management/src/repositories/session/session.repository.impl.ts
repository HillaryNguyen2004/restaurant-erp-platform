import { Injectable } from '@nestjs/common';
import { ISessionRepository } from './session.repository.interface';
import { UserSession } from '../../domains/entities/user-session.entity';

@Injectable()
export class SessionRepositoryImpl implements ISessionRepository {
  private readonly sessions = new Map<string, UserSession>();

  save(session: UserSession): Promise<void> {
    this.sessions.set(session.id, session);
    return Promise.resolve();
  }

  async findActiveByUserId(userId: string): Promise<UserSession[]> {
    return [...this.sessions.values()].filter(
      (s) => s.userId === userId && !s.isRevoked,
    );
  }

  revokeByUserId(userId: string): Promise<void> {
    for (const session of this.sessions.values()) {
      if (session.userId === userId) {
        session.revoke();
      }
    }
    return Promise.resolve();
  }
}
