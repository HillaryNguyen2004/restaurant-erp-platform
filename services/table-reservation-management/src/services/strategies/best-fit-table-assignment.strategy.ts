import { Injectable } from '@nestjs/common';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { ITableAssignmentStrategy } from './table-assignment-strategy.interface';

@Injectable()
export class BestFitTableAssignmentStrategy implements ITableAssignmentStrategy {
  selectTable(
    candidateTables: RestaurantTable[],
    partySize: number,
  ): RestaurantTable {
    const suitableTables = candidateTables
      .filter((table) => table.canFit(partySize))
      .sort((a, b) => a.capacity - b.capacity);

    if (suitableTables.length === 0) {
      throw new Error('No suitable table available');
    }

    return suitableTables[0];
  }
}
