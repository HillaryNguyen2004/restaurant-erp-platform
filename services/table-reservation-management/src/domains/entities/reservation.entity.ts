// domains/entities/reservation.entity.ts

import { TimeSlot } from '../value-objects/time-slot.vo';

export enum ReservationStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  ARRIVED = 'ARRIVED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW',
  COMPLETED = 'COMPLETED',
}

export class Reservation {
  constructor(
    public readonly reservationId: string,
    public customerName: string,
    public contactNumber: string,
    public partySize: number,
    public timeSlot: TimeSlot,
    public status: ReservationStatus,
    public tableId: string,
    public notes?: string,
  ) {}

  confirm(): void {
    if (this.status !== ReservationStatus.PENDING) {
      throw new Error('Only pending reservations can be confirmed');
    }

    this.status = ReservationStatus.CONFIRMED;
  }

  extend(newSlot: TimeSlot): void {
    if (!this.isActive()) {
      throw new Error('Only active reservations can be extended');
    }

    this.timeSlot = newSlot;
  }

  cancel(): void {
    if (this.status === ReservationStatus.CANCELLED) {
      throw new Error('Reservation is already cancelled');
    }

    if (this.status === ReservationStatus.ARRIVED) {
      throw new Error('Arrived reservation cannot be cancelled');
    }

    if (this.status === ReservationStatus.COMPLETED) {
      throw new Error('Completed reservation cannot be cancelled');
    }

    this.status = ReservationStatus.CANCELLED;
  }

  checkIn(): void {
    if (this.status !== ReservationStatus.CONFIRMED) {
      throw new Error('Only confirmed reservations can be checked in');
    }

    this.status = ReservationStatus.ARRIVED;
  }

  markNoShow(): void {
    if (this.status !== ReservationStatus.CONFIRMED) {
      throw new Error('Only confirmed reservations can be marked as no-show');
    }

    this.status = ReservationStatus.NO_SHOW;
  }

  complete(): void {
    if (this.status !== ReservationStatus.ARRIVED) {
      throw new Error('Only arrived reservations can be completed');
    }

    this.status = ReservationStatus.COMPLETED;
  }

  isActive(): boolean {
    return (
      this.status === ReservationStatus.PENDING ||
      this.status === ReservationStatus.CONFIRMED ||
      this.status === ReservationStatus.ARRIVED
    );
  }
}
