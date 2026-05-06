import { Injectable } from '@nestjs/common';
import { DiningSession } from '../../domains/entities/dining-session.entity';
import { IServiceTimeTracker } from './service-time-tracker.interface';

@Injectable()
export class ServiceTimeTracker implements IServiceTimeTracker {
  calculateRemaining(session: DiningSession, currentTime = new Date()): number {
    return session.getRemainingTime(currentTime);
  }

  isOvertime(session: DiningSession, currentTime = new Date()): boolean {
    return session.isOvertime(currentTime);
  }
}
