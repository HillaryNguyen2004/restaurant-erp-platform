// table-reservation-management.module.ts

import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';

import {
  AVAILABILITY_CHECKER,
  AVAILABILITY_SERVICE,
  DINING_SESSION_MAPPER,
  DINING_SESSION_REPOSITORY,
  DINING_SESSION_SERVICE,
  EVENT_PUBLISHER,
  RESERVATION_MAPPER,
  RESERVATION_REPOSITORY,
  RESERVATION_SERVICE,
  RESERVATION_VALIDATOR,
  SERVICE_TIME_TRACKER,
  TABLE_ASSIGNMENT_STRATEGY,
  TABLE_MAPPER,
  TABLE_REPOSITORY,
  TABLE_STATE_SERVICE,
  WAIT_TIME_ESTIMATOR,
} from './constants/injection-tokens';

import { ReservationControllerImpl } from './controllers/reservation/reservation.controller.impl';
import { AvailabilityControllerImpl } from './controllers/availability/availability.controller.impl';
import { TableStateControllerImpl } from './controllers/table-state/table-state.controller.impl';
import { DiningSessionControllerImpl } from './controllers/dining-session/dining-session.controller.impl';

import { ReservationRepositoryImpl } from './repositories/reservation/reservation.repository.impl';
import { TableRepositoryImpl } from './repositories/table/table.repository.impl';
import { DiningSessionRepositoryImpl } from './repositories/dining-session/dining-session.repository.impl';

import { EventPublisherAdapter } from './adapters/event-publisher.adapter';

import { AvailabilityServiceImpl } from './services/availability/availability.service.impl';
import { DiningSessionServiceImpl } from './services/dining-session/dining-session.service.impl';
import { ReservationServiceImpl } from './services/reservation/reservation.service.impl';
import { TableStateServiceImpl } from './services/table-state/table-state.service.impl';

import { AvailabilityChecker } from './services/checkers/availability-checker.impl';
import { WaitTimeEstimator } from './services/estimators/wait-time-estimator.impl';
import { ServiceTimeTracker } from './services/trackers/service-time-tracker.impl';
import { ReservationValidator } from './services/validators/reservation-validator.impl';
import { BestFitTableAssignmentStrategy } from './services/strategies/best-fit-table-assignment.strategy';

import { ReservationMapper } from './mappers/reservation/reservation-mapper.impl';
import { TableMapper } from './mappers/table/table-mapper.impl';
import { DiningSessionMapper } from './mappers/dining-session/dining-session-mapper.impl';

@Module({
  imports: [PrismaModule],

  controllers: [
    ReservationControllerImpl,
    AvailabilityControllerImpl,
    TableStateControllerImpl,
    DiningSessionControllerImpl,
  ],

  providers: [
    {
      provide: RESERVATION_REPOSITORY,
      useClass: ReservationRepositoryImpl,
    },
    {
      provide: TABLE_REPOSITORY,
      useClass: TableRepositoryImpl,
    },
    {
      provide: DINING_SESSION_REPOSITORY,
      useClass: DiningSessionRepositoryImpl,
    },
    {
      provide: EVENT_PUBLISHER,
      useClass: EventPublisherAdapter,
    },
    {
      provide: AVAILABILITY_CHECKER,
      useClass: AvailabilityChecker,
    },
    {
      provide: WAIT_TIME_ESTIMATOR,
      useClass: WaitTimeEstimator,
    },
    {
      provide: SERVICE_TIME_TRACKER,
      useClass: ServiceTimeTracker,
    },
    {
      provide: RESERVATION_VALIDATOR,
      useClass: ReservationValidator,
    },
    {
      provide: TABLE_ASSIGNMENT_STRATEGY,
      useClass: BestFitTableAssignmentStrategy,
    },
    {
      provide: RESERVATION_MAPPER,
      useClass: ReservationMapper,
    },
    {
      provide: TABLE_MAPPER,
      useClass: TableMapper,
    },
    {
      provide: DINING_SESSION_MAPPER,
      useClass: DiningSessionMapper,
    },
    {
      provide: RESERVATION_SERVICE,
      useClass: ReservationServiceImpl,
    },
    {
      provide: AVAILABILITY_SERVICE,
      useClass: AvailabilityServiceImpl,
    },
    {
      provide: TABLE_STATE_SERVICE,
      useClass: TableStateServiceImpl,
    },
    {
      provide: DINING_SESSION_SERVICE,
      useClass: DiningSessionServiceImpl,
    },
  ],

  exports: [
    RESERVATION_SERVICE,
    AVAILABILITY_SERVICE,
    TABLE_STATE_SERVICE,
    DINING_SESSION_SERVICE,
  ],
})
export class TableReservationManagementModule {}
