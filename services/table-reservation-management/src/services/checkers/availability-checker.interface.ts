import { Reservation } from '../../domains/entities/reservation.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';

export interface IAvailabilityChecker {
  findAvailableTables(
    timeSlot: TimeSlot,
    partySize: number,
    reservations: Reservation[],
    tables: RestaurantTable[],
  ): RestaurantTable[];

  isTableAvailable(
    table: RestaurantTable,
    timeSlot: TimeSlot,
    reservations: Reservation[],
  ): boolean;
}
