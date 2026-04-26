import { Injectable, Logger } from '@nestjs/common';
import { DiningSession } from '../domains/entities/dining-session.entity';
import { Reservation } from '../domains/entities/reservation.entity';
import { RestaurantTable } from '../domains/entities/restaurant-table.entity';
import { IEventPublisher } from '../ports/event-publisher.interface';

@Injectable()
export class EventPublisherAdapter implements IEventPublisher {
  private readonly logger = new Logger(EventPublisherAdapter.name);

  publishReservationCreated(reservation: Reservation): Promise<void> {
    this.logger.log(`reservation.created: ${reservation.reservationId}`);
    return Promise.resolve();
  }

  publishReservationExtended(reservation: Reservation): Promise<void> {
    this.logger.log(`reservation.extended: ${reservation.reservationId}`);
    return Promise.resolve();
  }

  publishReservationCancelled(reservation: Reservation): Promise<void> {
    this.logger.log(`reservation.cancelled: ${reservation.reservationId}`);
    return Promise.resolve();
  }

  publishReservationCheckedIn(reservation: Reservation): Promise<void> {
    this.logger.log(`reservation.checked-in: ${reservation.reservationId}`);
    return Promise.resolve();
  }

  publishReservationNoShow(reservation: Reservation): Promise<void> {
    this.logger.log(`reservation.no-show: ${reservation.reservationId}`);
    return Promise.resolve();
  }

  publishTableStateChanged(table: RestaurantTable): Promise<void> {
    this.logger.log(`table.state-changed: ${table.tableId}`);
    return Promise.resolve();
  }

  publishDiningSessionStarted(session: DiningSession): Promise<void> {
    this.logger.log(`dining-session.started: ${session.sessionId}`);
    return Promise.resolve();
  }

  publishDiningSessionExtended(session: DiningSession): Promise<void> {
    this.logger.log(`dining-session.extended: ${session.sessionId}`);
    return Promise.resolve();
  }

  publishDiningSessionFinished(session: DiningSession): Promise<void> {
    this.logger.log(`dining-session.finished: ${session.sessionId}`);
    return Promise.resolve();
  }
}
