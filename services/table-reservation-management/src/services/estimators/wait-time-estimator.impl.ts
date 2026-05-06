import { Injectable } from '@nestjs/common';
import {
  DiningSession,
  DiningSessionStatus,
} from '../../domains/entities/dining-session.entity';
import {
  RestaurantTable,
  TableStatus,
} from '../../domains/entities/restaurant-table.entity';
import { IWaitTimeEstimator } from './wait-time-estimator.interface';

@Injectable()
export class WaitTimeEstimator implements IWaitTimeEstimator {
  estimate(
    partySize: number,
    sessions: DiningSession[],
    tables: RestaurantTable[],
    currentTime = new Date(),
  ): number {
    const freeTable = tables.find(
      (table) => table.status === TableStatus.FREE && table.canFit(partySize),
    );

    if (freeTable) return 0;

    const activeSuitableSessions = sessions.filter((session) => {
      const table = tables.find((t) => t.tableId === session.tableId);

      return (
        table?.canFit(partySize) &&
        session.status !== DiningSessionStatus.FINISHED
      );
    });

    if (activeSuitableSessions.length === 0) {
      return -1;
    }

    return Math.min(
      ...activeSuitableSessions.map((session) =>
        session.getRemainingTime(currentTime),
      ),
    );
  }
}
