import { Injectable } from '@nestjs/common';
import { DiningSession as PrismaDiningSession } from '@prisma/client';
import {
  DiningSession,
  DiningSessionStatus,
  TableBillingStatus,
} from '../../domains/entities/dining-session.entity';
import { PrismaService } from '../../prisma/prisma.service';
import { IDiningSessionRepository } from './dining-session-repository.interface';

@Injectable()
export class DiningSessionRepositoryImpl implements IDiningSessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async save(session: DiningSession): Promise<DiningSession> {
    const row = await this.prisma.diningSession.upsert({
      where: { sessionId: session.sessionId },
      update: {
        tableId: session.tableId,
        reservationId: session.reservationId,
        startedAt: session.startedAt,
        expectedEndAt: session.expectedEndAt,
        actualEndAt: session.actualEndAt,
        status: session.status,
        billingStatus: session.billingStatus,
      },
      create: {
        sessionId: session.sessionId,
        tableId: session.tableId,
        reservationId: session.reservationId,
        startedAt: session.startedAt,
        expectedEndAt: session.expectedEndAt,
        actualEndAt: session.actualEndAt,
        status: session.status,
        billingStatus: session.billingStatus,
      },
    });

    return this.toDomain(row);
  }

  async findById(id: string): Promise<DiningSession | null> {
    const row = await this.prisma.diningSession.findUnique({
      where: { sessionId: id },
    });

    return row ? this.toDomain(row) : null;
  }

  async findActiveByTableId(tableId: string): Promise<DiningSession | null> {
    const row = await this.prisma.diningSession.findFirst({
      where: {
        tableId,
        status: {
          in: [DiningSessionStatus.ACTIVE, DiningSessionStatus.EXTENDED],
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    return row ? this.toDomain(row) : null;
  }

  async findActiveSessions(): Promise<DiningSession[]> {
    const rows = await this.prisma.diningSession.findMany({
      where: {
        status: {
          in: [DiningSessionStatus.ACTIVE, DiningSessionStatus.EXTENDED],
        },
      },
      orderBy: { startedAt: 'asc' },
    });

    return rows.map((row) => this.toDomain(row));
  }

  private toDomain(row: PrismaDiningSession): DiningSession {
    return new DiningSession(
      row.sessionId,
      row.tableId,
      row.reservationId ?? null,
      row.startedAt,
      row.expectedEndAt,
      row.actualEndAt ?? null,
      row.status as DiningSessionStatus,
      row.billingStatus as TableBillingStatus,
    );
  }
}
