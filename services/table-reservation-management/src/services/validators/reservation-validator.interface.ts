import { CreateReservationDto } from '../../dtos/create-reservation.dto';
import { Reservation } from '../../domains/entities/reservation.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';

export interface IReservationValidator {
  validateCreate(dto: CreateReservationDto): void;
  validateExtension(reservation: Reservation, newSlot: TimeSlot): void;
  validateCancellation(reservation: Reservation): void;
  validateCheckIn(reservation: Reservation): void;
}
