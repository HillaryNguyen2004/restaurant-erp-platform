import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'crypto';

import {
  EVENT_PUBLISHER,
  RESERVATION_MAPPER,
  RESERVATION_REPOSITORY,
  RESERVATION_VALIDATOR,
  TABLE_ASSIGNMENT_STRATEGY,
  TABLE_REPOSITORY,
} from '../../constants/injection-tokens';

import { CreateReservationDto } from '../../dtos/create-reservation.dto';
import { ExtendReservationDto } from '../../dtos/extend-reservation.dto';
import { ReservationCalendarQueryDto } from '../../dtos/reservation-calendar-query.dto';
import { ReservationResponseDto } from '../../dtos/reservation-response.dto';
import { DiningSessionResponseDto } from '../../dtos/dining-session-response.dto';

import {
  Reservation,
  ReservationStatus,
} from '../../domains/entities/reservation.entity';
import { TimeSlot } from '../../domains/value-objects/time-slot.vo';

import * as reservationRepositoryInterface from '../../repositories/reservation/reservation-repository.interface';
import * as tableRepositoryInterface from '../../repositories/table/table-repository.interface';

import * as eventPublisherInterface from '../../ports/event-publisher.interface';
import * as tableAssignmentStrategyInterface from '../strategies/table-assignment-strategy.interface';
import * as reservationValidatorInterface from '../validators/reservation-validator.interface';
import * as reservationMapperInterface from '../../mappers/reservation/reservation-mapper.interface';
import { IReservationService } from './reservation.service.interface';

@Injectable()
export class ReservationServiceImpl implements IReservationService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: reservationRepositoryInterface.IReservationRepository,

    @Inject(TABLE_REPOSITORY)
    private readonly tableRepo: tableRepositoryInterface.ITableRepository,

    @Inject(RESERVATION_VALIDATOR)
    private readonly validator: reservationValidatorInterface.IReservationValidator,

    @Inject(TABLE_ASSIGNMENT_STRATEGY)
    private readonly assignmentStrategy: tableAssignmentStrategyInterface.ITableAssignmentStrategy,

    @Inject(EVENT_PUBLISHER)
    private readonly eventPublisher: eventPublisherInterface.IEventPublisher,

    @Inject(RESERVATION_MAPPER)
    private readonly mapper: reservationMapperInterface.IReservationMapper,
  ) {}

  async createReservation(
    dto: CreateReservationDto,
  ): Promise<ReservationResponseDto> {
    this.validator.validateCreate(dto);

    const timeSlot = new TimeSlot(
      new Date(dto.startTime),
      new Date(dto.endTime),
    );

    const candidateTables = await this.tableRepo.findByMinimumCapacity(
      dto.partySize,
    );

    const overlappingReservations =
      await this.reservationRepo.findOverlapping(timeSlot);

    const availableTables = candidateTables.filter((table) => {
      return !overlappingReservations.some(
        (reservation) => reservation.tableId === table.tableId,
      );
    });

    const selectedTable = this.assignmentStrategy.selectTable(
      availableTables,
      dto.partySize,
    );

    const reservation = new Reservation(
      randomUUID(),
      dto.customerName,
      dto.contactNumber,
      dto.partySize,
      timeSlot,
      ReservationStatus.CONFIRMED,
      selectedTable.tableId,
      dto.notes,
    );

    selectedTable.markReserved();

    const savedReservation = await this.reservationRepo.save(reservation);
    await this.tableRepo.save(selectedTable);
    await this.eventPublisher.publishReservationCreated(savedReservation);

    return this.mapper.toResponseDto(savedReservation, selectedTable);
  }

  async extendReservation(
    id: string,
    dto: ExtendReservationDto,
  ): Promise<ReservationResponseDto> {
    const reservation = await this.getReservationOrThrow(id);

    const newSlot = reservation.timeSlot.extendTo(new Date(dto.newEndTime));

    this.validator.validateExtension(reservation, newSlot);

    const overlappingReservations =
      await this.reservationRepo.findOverlapping(newSlot);

    const hasConflict = overlappingReservations.some((other) => {
      return (
        other.reservationId !== reservation.reservationId &&
        other.tableId === reservation.tableId
      );
    });

    if (hasConflict) {
      throw new BadRequestException(
        'Reservation cannot be extended because the table has another reservation',
      );
    }

    reservation.extend(newSlot);

    const savedReservation = await this.reservationRepo.save(reservation);
    const table = await this.tableRepo.findById(savedReservation.tableId);

    await this.eventPublisher.publishReservationExtended(savedReservation);

    return this.mapper.toResponseDto(savedReservation, table);
  }

  async cancelReservation(id: string): Promise<void> {
    const reservation = await this.getReservationOrThrow(id);

    this.validator.validateCancellation(reservation);

    reservation.cancel();

    const table = await this.tableRepo.findById(reservation.tableId);
    if (table) {
      table.markAvailable();
      await this.tableRepo.save(table);
    }

    await this.reservationRepo.save(reservation);
    await this.eventPublisher.publishReservationCancelled(reservation);
  }

  async checkInReservation(id: string): Promise<DiningSessionResponseDto> {
    throw new BadRequestException(
      'Use DiningSessionService.startFromReservation() for check-in workflow',
    );
  }

  async markNoShow(id: string): Promise<void> {
    const reservation = await this.getReservationOrThrow(id);

    reservation.markNoShow();

    const table = await this.tableRepo.findById(reservation.tableId);
    if (table) {
      table.markAvailable();
      await this.tableRepo.save(table);
    }

    await this.reservationRepo.save(reservation);
    await this.eventPublisher.publishReservationNoShow(reservation);
  }

  async getReservation(id: string): Promise<ReservationResponseDto> {
    const reservation = await this.getReservationOrThrow(id);
    const table = await this.tableRepo.findById(reservation.tableId);

    return this.mapper.toResponseDto(reservation, table);
  }

  async getReservationsByDateRange(
    dto: ReservationCalendarQueryDto,
  ): Promise<ReservationResponseDto[]> {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);

    const reservations = await this.reservationRepo.findByDateRange(start, end);
    const tables = await this.tableRepo.findAll();

    return this.mapper.toResponseDtoList(reservations, tables);
  }

  private async getReservationOrThrow(id: string): Promise<Reservation> {
    const reservation = await this.reservationRepo.findById(id);

    if (!reservation) {
      throw new NotFoundException(`Reservation ${id} not found`);
    }

    return reservation;
  }
}
