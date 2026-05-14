import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka } from 'kafkajs';
import { TableWsGateway, TableWsEventEnvelope } from './table-ws.gateway';

/**
 * Kafka topics mirrored out through the `/ws/tables` WebSocket.
 *
 * These are the same topics that `EventPublisherAdapter.publishTableStateChanged`
 * and `publishDiningSession*` write to, so any client subscribed to the
 * WebSocket receives a live view of restaurant-wide table + dining-session
 * state transitions.
 */
const TABLE_WS_TOPICS = [
  'table.state-changed',
  'dining-session.started',
  'dining-session.extended',
  'dining-session.finished',
] as const;

/**
 * Consumer that bridges Kafka → WebSocket.
 *
 * On startup it connects a dedicated consumer (distinct `groupId` so it does
 * not share offsets with other bridges/consumers), subscribes to the table
 * / dining-session topics, parses each envelope, and forwards it verbatim
 * to every connected client via `TableWsGateway.broadcast`.
 *
 * Malformed messages are logged and skipped; the consumer keeps running so
 * one bad event cannot stop the live stream.
 */
@Injectable()
export class TableEventsKafkaConsumer
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(TableEventsKafkaConsumer.name);
  private readonly consumer: Consumer;

  constructor(private readonly gateway: TableWsGateway) {
    const kafka = new Kafka({
      clientId:
        process.env.KAFKA_CLIENT_ID ?? 'table-reservation-management-service',
      brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
    });

    this.consumer = kafka.consumer({
      groupId:
        process.env.KAFKA_TABLES_WS_GROUP_ID ??
        'table-reservation-management.ws.tables',
    });
  }

  async onModuleInit(): Promise<void> {
    await this.consumer.connect();

    for (const topic of TABLE_WS_TOPICS) {
      await this.consumer.subscribe({ topic, fromBeginning: false });
    }

    await this.consumer.run({
      eachMessage: async ({ topic, message }) => {
        if (!message.value) return;

        let envelope: TableWsEventEnvelope;
        try {
          const parsed = JSON.parse(
            message.value.toString(),
          ) as Partial<TableWsEventEnvelope>;

          envelope = {
            eventId: parsed.eventId,
            eventType: parsed.eventType ?? topic,
            occurredAt: parsed.occurredAt,
            aggregateId: parsed.aggregateId,
            data: parsed.data ?? {},
          };
        } catch (err) {
          this.logger.warn(
            `Discarding malformed event on topic ${topic}: ${(err as Error).message}`,
          );
          return;
        }

        this.gateway.broadcast(envelope);
      },
    });

    this.logger.log(
      `Subscribed to Kafka topics: ${TABLE_WS_TOPICS.join(', ')}`,
    );
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.consumer.disconnect();
    } catch (err) {
      this.logger.warn(
        `Error while disconnecting Kafka consumer: ${(err as Error).message}`,
      );
    }
  }
}
