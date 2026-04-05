export abstract class DomainEvent {
  constructor(
    public readonly eventId: string,
    public readonly occurredAt: Date,
  ) {}

  abstract readonly eventType: string;
  abstract toPayload(): Record<string, unknown>;
}
