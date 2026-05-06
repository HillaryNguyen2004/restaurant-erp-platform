import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';

export interface ITableAssignmentStrategy {
  selectTable(
    candidateTables: RestaurantTable[],
    partySize: number,
  ): RestaurantTable;
}
