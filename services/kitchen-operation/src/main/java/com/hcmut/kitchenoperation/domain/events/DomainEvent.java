package com.hcmut.kitchenoperation.domain.events;

import lombok.Getter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
public abstract class DomainEvent {
    private final UUID eventId;
    private final Instant occurredAt;

    protected DomainEvent() {
        this.eventId = UUID.randomUUID();
        this.occurredAt = Instant.now();
    }

    public abstract String getEventType();

    public abstract String getAggregateId();

    public abstract Map<String, Object> toPayload();
}
