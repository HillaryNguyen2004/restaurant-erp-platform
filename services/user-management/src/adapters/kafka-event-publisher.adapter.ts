import { Injectable, OnModuleInit } from '@nestjs/common';
import { Kafka } from 'kafkajs';
import { IEventPublisher } from '../ports/event-publisher.interface';
import { DomainEvent } from '../domains/events/domain.event';

@Injectable()
export class KafkaEventPublisherAdapter
  implements IEventPublisher, OnModuleInit
{
  private readonly producer = new Kafka({
    clientId: 'user-management-service',
    brokers: ['localhost:9092'],
  }).producer();

  async onModuleInit(): Promise<void> {
    await this.producer.connect();
  }

  async publish(event: DomainEvent): Promise<void> {
    await this.producer.send({
      topic: event.eventType,
      messages: [
        {
          key: event.eventId,
          value: JSON.stringify({
            eventId: event.eventId,
            eventType: event.eventType,
            occurredAt: event.occurredAt.toISOString(),
            data: event.toPayload(),
          }),
        },
      ],
    });
  }
}
