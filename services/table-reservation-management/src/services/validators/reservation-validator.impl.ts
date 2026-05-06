import { Injectable } from '@nestjs/common';
import { CreateReservationDto } from '../../dtos/create-reservation.dto';
import {
  Reservation,
  ReservationStatus,
} from '../../domains/entities/reservation.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';
import { IReservationValidator } from './reservation-validator.interface';

@Injectable()
export class ReservationValidator implements IReservationValidator {
  validateCreate(dto: CreateReservationDto): void {
    if (!dto.customerName?.trim()) {
      throw new Error('Customer name is required');
    }

    if (!dto.contactNumber?.trim()) {
      throw new Error('Contact number is required');
    }

    if (!Number.isInteger(dto.partySize) || dto.partySize <= 0) {
      throw new Error('Party size must be a positive integer');
    }

    new TimeSlot(new Date(dto.startTime), new Date(dto.endTime));
  }

  validateExtension(reservation: Reservation, newSlot: TimeSlot): void {
    if (!reservation.isActive()) {
      throw new Error('Only active reservations can be extended');
    }

    if (newSlot.end <= reservation.timeSlot.end) {
      throw new Error('New end time must be later than current end time');
    }
  }

  validateCancellation(reservation: Reservation): void {
    if (
      reservation.status === ReservationStatus.ARRIVED ||
      reservation.status === ReservationStatus.COMPLETED
    ) {
      throw new Error('Arrived or completed reservations cannot be cancelled');
    }
  }

  validateCheckIn(reservation: Reservation): void {
    if (reservation.status !== ReservationStatus.CONFIRMED) {
      throw new Error('Only confirmed reservations can be checked in');
    }
  }
}
