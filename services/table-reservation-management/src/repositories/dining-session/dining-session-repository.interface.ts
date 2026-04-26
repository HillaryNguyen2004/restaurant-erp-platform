import { DiningSession } from '../../domains/entities/dining-session.entity';

export interface IDiningSessionRepository {
  save(session: DiningSession): Promise<DiningSession>;
  findById(id: string): Promise<DiningSession | null>;
  findActiveByTableId(tableId: string): Promise<DiningSession | null>;
  findActiveSessions(): Promise<DiningSession[]>;
}
