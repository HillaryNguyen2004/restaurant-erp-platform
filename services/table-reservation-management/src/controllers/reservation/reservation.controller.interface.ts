import { CreateReservationDto } from '../../dtos/create-reservation.dto';
import { ExtendReservationDto } from '../../dtos/extend-reservation.dto';
import { ReservationCalendarQueryDto } from '../../dtos/reservation-calendar-query.dto';
import { ReservationResponseDto } from '../../dtos/reservation-response.dto';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';

export interface IReservationController {
  createReservation(dto: CreateReservationDto): Promise<ReservationResponseDto>;

  extendReservation(
    id: string,
    dto: ExtendReservationDto,
  ): Promise<ReservationResponseDto>;

  cancelReservation(id: string): Promise<void>;

  checkInReservation(id: string): Promise<DiningSessionResponseDto>;

  markNoShow(id: string): Promise<void>;

  getReservation(id: string): Promise<ReservationResponseDto>;

  getReservationsByDateRange(
    dto: ReservationCalendarQueryDto,
  ): Promise<ReservationResponseDto[]>;
}
