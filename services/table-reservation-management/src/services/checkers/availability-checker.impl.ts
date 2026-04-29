import { Injectable } from '@nestjs/common';
import { Reservation } from '../../domains/entities/reservation.entity';
import {
  RestaurantTable,
  TableStatus,
} from '../../domains/entities/restaurant-table.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';
import { IAvailabilityChecker } from './availability-checker.interface';

@Injectable()
export class AvailabilityChecker implements IAvailabilityChecker {
  findAvailableTables(
    timeSlot: TimeSlot,
    partySize: number,
    reservations: Reservation[],
    tables: RestaurantTable[],
  ): RestaurantTable[] {
    return tables.filter((table) => {
      return (
        table.status !== TableStatus.OUT_OF_ORDER &&
        table.canFit(partySize) &&
        this.isTableAvailable(table, timeSlot, reservations)
      );
    });
  }

  isTableAvailable(
    table: RestaurantTable,
    timeSlot: TimeSlot,
    reservations: Reservation[],
  ): boolean {
    return !reservations.some((reservation) => {
      return (
        reservation.tableId === table.tableId &&
        reservation.timeSlot.overlaps(timeSlot)
      );
    });
  }
}
