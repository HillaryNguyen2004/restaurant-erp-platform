import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Kafka, Producer } from 'kafkajs';
import { DiningSession } from '../domains/entities/dining-session.entity';
import { Reservation } from '../domains/entities/reservation.entity';
import { RestaurantTable } from '../domains/entities/restaurant-table.entity';
import { IEventPublisher } from '../ports/event-publisher.interface';

@Injectable()
export class EventPublisherAdapter
  implements IEventPublisher, OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(EventPublisherAdapter.name);
  private readonly producer: Producer;

  constructor() {
    this.producer = new Kafka({
      clientId:
        process.env.KAFKA_CLIENT_ID ?? 'table-reservation-management-service',
      brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
    }).producer();
  }

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.producer.disconnect();
  }

  publishReservationCreated(reservation: Reservation): Promise<void> {
    return this.publish('reservation.created', reservation.reservationId, {
      reservationId: reservation.reservationId,
      customerName: reservation.customerName,
      contactNumber: reservation.contactNumber,
      partySize: reservation.partySize,
      startTime: reservation.timeSlot.start.toISOString(),
      endTime: reservation.timeSlot.end.toISOString(),
      status: reservation.status,
      tableId: reservation.tableId,
      notes: reservation.notes,
    });
  }

  publishReservationExtended(reservation: Reservation): Promise<void> {
    return this.publish('reservation.extended', reservation.reservationId, {
      reservationId: reservation.reservationId,
      startTime: reservation.timeSlot.start.toISOString(),
      endTime: reservation.timeSlot.end.toISOString(),
      status: reservation.status,
      tableId: reservation.tableId,
    });
  }

  publishReservationCancelled(reservation: Reservation): Promise<void> {
    return this.publish('reservation.cancelled', reservation.reservationId, {
      reservationId: reservation.reservationId,
      status: reservation.status,
      tableId: reservation.tableId,
    });
  }

  publishReservationCheckedIn(reservation: Reservation): Promise<void> {
    return this.publish('reservation.checked-in', reservation.reservationId, {
      reservationId: reservation.reservationId,
      status: reservation.status,
      tableId: reservation.tableId,
    });
  }

  publishReservationNoShow(reservation: Reservation): Promise<void> {
    return this.publish('reservation.no-show', reservation.reservationId, {
      reservationId: reservation.reservationId,
      status: reservation.status,
      tableId: reservation.tableId,
    });
  }

  publishTableStateChanged(table: RestaurantTable): Promise<void> {
    return this.publish('table.state-changed', table.tableId, {
      tableId: table.tableId,
      tableNumber: table.tableNumber,
      capacity: table.capacity,
      status: table.status,
      zone: table.zone,
    });
  }

  publishDiningSessionStarted(session: DiningSession): Promise<void> {
    return this.publish('dining-session.started', session.sessionId, {
      sessionId: session.sessionId,
      tableId: session.tableId,
      reservationId: session.reservationId,
      startedAt: session.startedAt.toISOString(),
      expectedEndAt: session.expectedEndAt.toISOString(),
      status: session.status,
      billingStatus: session.billingStatus,
    });
  }

  publishDiningSessionExtended(session: DiningSession): Promise<void> {
    return this.publish('dining-session.extended', session.sessionId, {
      sessionId: session.sessionId,
      tableId: session.tableId,
      reservationId: session.reservationId,
      expectedEndAt: session.expectedEndAt.toISOString(),
      status: session.status,
      billingStatus: session.billingStatus,
    });
  }

  publishDiningSessionFinished(session: DiningSession): Promise<void> {
    return this.publish('dining-session.finished', session.sessionId, {
      sessionId: session.sessionId,
      tableId: session.tableId,
      reservationId: session.reservationId,
      actualEndAt: session.actualEndAt?.toISOString() ?? null,
      status: session.status,
      billingStatus: session.billingStatus,
    });
  }

  private async publish(
    eventType: string,
    aggregateId: string,
    data: Record<string, unknown>,
  ): Promise<void> {
    const eventId = randomUUID();
    const envelope = {
      eventId,
      eventType,
      occurredAt: new Date().toISOString(),
      aggregateId,
      data,
    };

    await this.producer.send({
      topic: eventType,
      messages: [
        {
          key: aggregateId,
          value: JSON.stringify(envelope),
        },
      ],
    });

    this.logger.log(`published ${eventType}: ${aggregateId}`);
  }
}
