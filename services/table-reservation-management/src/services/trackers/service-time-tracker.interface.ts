import { DiningSession } from '../../domains/entities/dining-session.entity';

export interface IServiceTimeTracker {
  calculateRemaining(session: DiningSession, currentTime?: Date): number;
  isOvertime(session: DiningSession, currentTime?: Date): boolean;
}
