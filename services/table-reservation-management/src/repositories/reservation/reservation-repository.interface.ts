import { Reservation } from '../../domains/entities/reservation.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';

export interface IReservationRepository {
  save(reservation: Reservation): Promise<Reservation>;
  findById(id: string): Promise<Reservation | null>;
  findOverlapping(timeSlot: TimeSlot): Promise<Reservation[]>;
  findByDateRange(start: Date, end: Date): Promise<Reservation[]>;
}
