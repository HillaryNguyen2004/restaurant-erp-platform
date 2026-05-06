import { Inject, Injectable } from '@nestjs/common';

import {
  AVAILABILITY_CHECKER,
  DINING_SESSION_REPOSITORY,
  RESERVATION_REPOSITORY,
  TABLE_MAPPER,
  TABLE_REPOSITORY,
  WAIT_TIME_ESTIMATOR,
} from '../../constants/injection-tokens';

import { FindAvailableTablesDto } from '../../dtos/find-available-tables.dto';
import { GetWaitTimeDto } from '../../dtos/get-wait-time.dto';
import { TableResponseDto } from '../../dtos/table-response.dto';
import { WaitTimeResponseDto } from '../../dtos/wait-time-response.dto';

import { TimeSlot } from '../../domains/value-objects/time-slot.vo';

import type { IReservationRepository } from '../../repositories/reservation/reservation-repository.interface';
import type { ITableRepository } from '../../repositories/table/table-repository.interface';
import type { IDiningSessionRepository } from '../../repositories/dining-session/dining-session-repository.interface';

import type { IAvailabilityChecker } from '../checkers/availability-checker.interface';
import type { IWaitTimeEstimator } from '../estimators/wait-time-estimator.interface';
import type { ITableMapper } from '../../mappers/table/table-mapper.interface';
import { IAvailabilityService } from './availability.service.interface';

@Injectable()
export class AvailabilityServiceImpl implements IAvailabilityService {
  constructor(
    @Inject(RESERVATION_REPOSITORY)
    private readonly reservationRepo: IReservationRepository,

    @Inject(TABLE_REPOSITORY)
    private readonly tableRepo: ITableRepository,

    @Inject(DINING_SESSION_REPOSITORY)
    private readonly sessionRepo: IDiningSessionRepository,

    @Inject(AVAILABILITY_CHECKER)
    private readonly availabilityChecker: IAvailabilityChecker,

    @Inject(WAIT_TIME_ESTIMATOR)
    private readonly waitTimeEstimator: IWaitTimeEstimator,

    @Inject(TABLE_MAPPER)
    private readonly tableMapper: ITableMapper,
  ) {}

  async findAvailableTables(
    dto: FindAvailableTablesDto,
  ): Promise<TableResponseDto[]> {
    const timeSlot = new TimeSlot(
      new Date(dto.startTime),
      new Date(dto.endTime),
    );

    const reservations = await this.reservationRepo.findOverlapping(timeSlot);
    const tables = await this.tableRepo.findByMinimumCapacity(dto.partySize);

    const availableTables = this.availabilityChecker.findAvailableTables(
      timeSlot,
      dto.partySize,
      reservations,
      tables,
    );

    return this.tableMapper.toResponseDtoList(availableTables);
  }

  async getWaitTime(dto: GetWaitTimeDto): Promise<WaitTimeResponseDto> {
    const tables = await this.tableRepo.findAll();
    const sessions = await this.sessionRepo.findActiveSessions();

    const estimatedMinutes = this.waitTimeEstimator.estimate(
      dto.partySize,
      sessions,
      tables,
    );

    return { estimatedMinutes };
  }
}
