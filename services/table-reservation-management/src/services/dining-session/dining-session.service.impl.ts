import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  DINING_SESSION_MAPPER,
  DINING_SESSION_REPOSITORY,
  EVENT_PUBLISHER,
  RESERVATION_REPOSITORY,
  SERVICE_TIME_TRACKER,
  TABLE_REPOSITORY,
} from '../../constants/injection-tokens';

import { StartDiningSessionDto } from '../../dtos/start-dining-session.dto';
import { ExtendDiningSessionDto } from '../../dtos/extend-dining-session.dto';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';
import { ServiceTimeResponseDto } from '../../dtos/service-time-response.dto';

import {
  DiningSession,
  DiningSessionStatus,
  TableBillingStatus,
} from '../../domains/entities/dining-session.entity';
import { RestaurantTable } from '../../domains/entities/restaurant-table.entity';
import { Reservation } from '../../domains/entities/reservation.entity';

import type { IDiningSessionRepository } from '../../repositories/dining-session/dining-session-repository.interface';
import type { ITableRepository } from '../../repositories/table/table-repository.interface';
import type { IReservationRepository } from '../../repositories/reservation/reservation-repository.interface';

import type { IEventPublisher } from '../../ports/event-publisher.interface';
import type { IServiceTimeTracker } from '../trackers/service-time-tracker.interface';
import type { IDiningSessionMapper } from '../../mappers/dining-session/dining-session-mapper.interface';
import { IDiningSessionService } from './dining-session.service.interface';

@Injectable()
export class DiningSessionServiceImpl implements IDiningSessionService {
  constructor(
    @Inject(DINING_SESSION_REPOSITORY)
    private readonly sessionRepo: IDiningSessionRepository,

    @Inject(TABLE_REPOSITORY)
    private readonly tableRepo: ITableRepository,

    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: IReservationRepository,

    @Inject(SERVICE_TIME_TRACKER)
    private readonly serviceTimeTracker: IServiceTimeTracker,

    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: IEventPublisher,

    @Inject(DINING_SESSION_MAPPER)
    private readonly mapper: IDiningSessionMapper,
  ) {}

  async startSession(
    dto: StartDiningSessionDto,
  ): Promise<DiningSessionResponseDto> {
    const table = await this.getTableOrThrow(dto.tableId);

    const activeSession = await this.sessionRepo.findActiveByTableId(
      dto.tableId,
    );

    if (activeSession) {
      throw new BadRequestException('Table already has an active session');
    }

    table.markOccupied();

    const session = new DiningSession(
      randomUUID(),
      dto.tableId,
      dto.reservationId ?? null,
      new Date(),
      new Date(dto.expectedEndAt),
      null,
      DiningSessionStatus.ACTIVE,
      TableBillingStatus.NOT_READY,
    );

    const savedSession = await this.sessionRepo.save(session);
    const savedTable = await this.tableRepo.save(table);

    await this.eventPublisher.publishDiningSessionStarted(savedSession);
    await this.eventPublisher.publishTableStateChanged(savedTable);

    return this.mapper.toResponseDto(savedSession, savedTable);
  }

  async startFromReservation(
    reservationId: string,
  ): Promise<DiningSessionResponseDto> {
    const reservation = await this.getReservationOrThrow(reservationId);
    const table = await this.getTableOrThrow(reservation.tableId);

    const activeSession = await this.sessionRepo.findActiveByTableId(
      table.tableId,
    );

    if (activeSession) {
      throw new BadRequestException('Table already has an active session');
    }

    reservation.checkIn();
    table.markOccupied();

    const session = new DiningSession(
      randomUUID(),
      table.tableId,
      reservation.reservationId,
      new Date(),
      reservation.timeSlot.end,
      null,
      DiningSessionStatus.ACTIVE,
      TableBillingStatus.NOT_READY,
    );

    const savedReservation = await this.reservationRepo.save(reservation);
    const savedTable = await this.tableRepo.save(table);
    const savedSession = await this.sessionRepo.save(session);

    await this.eventPublisher.publishReservationCheckedIn(savedReservation);
    await this.eventPublisher.publishTableStateChanged(savedTable);
    await this.eventPublisher.publishDiningSessionStarted(savedSession);

    return this.mapper.toResponseDto(savedSession, savedTable);
  }

  async extendSession(
    sessionId: string,
    dto: ExtendDiningSessionDto,
  ): Promise<DiningSessionResponseDto> {
    const session = await this.getSessionOrThrow(sessionId);

    session.extend(new Date(dto.newExpectedEndAt));

    const savedSession = await this.sessionRepo.save(session);
    const table = await this.tableRepo.findById(savedSession.tableId);

    await this.eventPublisher.publishDiningSessionExtended(savedSession);

    return this.mapper.toResponseDto(savedSession, table);
  }

  async finishSession(sessionId: string): Promise<void> {
    const session = await this.getSessionOrThrow(sessionId);
    const table = await this.getTableOrThrow(session.tableId);

    session.finish();
    table.markAvailable();

    const savedSession = await this.sessionRepo.save(session);
    const savedTable = await this.tableRepo.save(table);

    await this.eventPublisher.publishDiningSessionFinished(savedSession);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  async checkoutActiveSessionByTable(tableId: string): Promise<void> {
    const session = await this.sessionRepo.findActiveByTableId(tableId);

    if (!session) {
      return;
    }

    const table = await this.getTableOrThrow(tableId);

    session.markPaid();
    session.finish();
    table.markAvailable();

    const savedSession = await this.sessionRepo.save(session);
    const savedTable = await this.tableRepo.save(table);

    await this.eventPublisher.publishDiningSessionFinished(savedSession);
    await this.eventPublisher.publishTableStateChanged(savedTable);
  }

  async getRemainingServiceTime(
    sessionId: string,
  ): Promise<ServiceTimeResponseDto> {
    const session = await this.getSessionOrThrow(sessionId);

    return {
      remainingMinutes: this.serviceTimeTracker.calculateRemaining(session),
      isOvertime: this.serviceTimeTracker.isOvertime(session),
    };
  }

  private async getSessionOrThrow(sessionId: string): Promise<DiningSession> {
    const session = await this.sessionRepo.findById(sessionId);

    if (!session) {
      throw new NotFoundException(`Dining session ${sessionId} not found`);
    }

    return session;
  }

  private async getTableOrThrow(tableId: string): Promise<RestaurantTable> {
    const table = await this.tableRepo.findById(tableId);

    if (!table) {
      throw new NotFoundException(`Table ${tableId} not found`);
    }

    return table;
  }

  private async getReservationOrThrow(
    reservationId: string,
  ): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(reservationId);

    if (!reservation) {
      throw new NotFoundException(`Reservation ${reservationId} not found`);
    }

    return reservation;
  }
}
