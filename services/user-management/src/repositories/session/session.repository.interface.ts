import { UserSession } from '../../domains/entities/user-session.entity';

export interface ISessionRepository {
  save(session: UserSession): Promise<void>;
  findActiveByUserId(userId: string): Promise<UserSession[]>;
  revokeByUserId(userId: string): Promise<void>;
}
