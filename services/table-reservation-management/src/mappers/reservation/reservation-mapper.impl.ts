import { Injectable } from '@nestjs/common';
import { Reservation } from '../../domains/entities/reservation.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { ReservationResponseDto } from '../../dtos/reservation-response.dto';
import { IReservationMapper } from './reservation-mapper.interface';

@Injectable()
export class ReservationMapper implements IReservationMapper {
  toResponseDto(
    reservation: Reservation,
    table?: RestaurantTable | null,
  ): ReservationResponseDto {
    return {
      reservationId: reservation.reservationId,
      customerName: reservation.customerName,
      partySize: reservation.partySize,
      startTime: reservation.timeSlot.start.toISOString(),
      endTime: reservation.timeSlot.end.toISOString(),
      status: reservation.status,
      tableNumber: table?.tableNumber ?? '',
    };
  }

  toResponseDtoList(
    reservations: Reservation[],
    tables: RestaurantTable[],
  ): ReservationResponseDto[] {
    return reservations.map((reservation) => {
      const table = tables.find((t) => t.tableId === reservation.tableId);
      return this.toResponseDto(reservation, table);
    });
  }
}
