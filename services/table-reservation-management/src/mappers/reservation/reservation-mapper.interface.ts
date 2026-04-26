// mappers/reservation/reservation-mapper.interface.ts

import { Reservation } from '../../domains/entities/reservation.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { ReservationResponseDto } from '../../dtos/reservation-response.dto';

export interface IReservationMapper {
  toResponseDto(
    reservation: Reservation,
    table?: RestaurantTable | null,
  ): ReservationResponseDto;

  toResponseDtoList(
    reservations: Reservation[],
    tables: RestaurantTable[],
  ): ReservationResponseDto[];
}
