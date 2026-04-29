import { DiningSession } from '../../domains/entities/dining-session.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';

export interface IWaitTimeEstimator {
  estimate(
    partySize: number,
    sessions: DiningSession[],
    tables: RestaurantTable[],
    currentTime?: Date,
  ): number;
}
