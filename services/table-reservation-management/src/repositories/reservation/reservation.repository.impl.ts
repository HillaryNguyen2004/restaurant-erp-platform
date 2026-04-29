// repositories/reservation/reservation.repository.impl.ts

import { Injectable } from '@nestjs/common';
import { Reservation as PrismaReservation } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  Reservation,
  ReservationStatus,
} from '../../domains/entities/reservation.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';
import { IReservationRepository } from './reservation-repository.interface';

@Injectable()
export class ReservationRepositoryImpl implements IReservationRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(reservation: Reservation): Promise<Reservation> {
    const row = await this.prisma.reservation.upsert({
      where: { reservationId: reservation.reservationId },
      update: {
        customerName: reservation.customerName,
        contactNumber: reservation.contactNumber,
        partySize: reservation.partySize,
        startTime: reservation.timeSlot.start,
        endTime: reservation.timeSlot.end,
        status: reservation.status,
        tableId: reservation.tableId,
        notes: reservation.notes,
      },
      create: {
        reservationId: reservation.reservationId,
        customerName: reservation.customerName,
        contactNumber: reservation.contactNumber,
        partySize: reservation.partySize,
        startTime: reservation.timeSlot.start,
        endTime: reservation.timeSlot.end,
        status: reservation.status,
        tableId: reservation.tableId,
        notes: reservation.notes,
      },
    });

    return this.toDomain(row);
  }

  async findById(id: string): Promise<Reservation | null> {
    const row = await this.prisma.reservation.findUnique({
      where: { reservationId: id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findOverlapping(timeSlot: TimeSlot): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({
      where: {
        status: {
          in: [
            ReservationStatus.PENDING,
            ReservationStatus.CONFIRMED,
            ReservationStatus.ARRIVED,
          ],
        },
        startTime: { lt: timeSlot.end },
        endTime: { gt: timeSlot.start },
      },
    });

    return rows.map((row) => this.toDomain(row));
  }

  async findByDateRange(start: Date, end: Date): Promise<Reservation[]> {
    const rows = await this.prisma.reservation.findMany({
      where: {
        startTime: { gte: start },
        endTime: { lte: end },
      },
      orderBy: { startTime: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: PrismaReservation): Reservation {
    return new Reservation(
      row.reservationId,
      row.customerName,
      row.contactNumber,
      row.partySize,
      new TimeSlot(row.startTime, row.endTime),
      row.status as ReservationStatus,
      row.tableId,
      row.notes ?? undefined,
    );
  }
}
