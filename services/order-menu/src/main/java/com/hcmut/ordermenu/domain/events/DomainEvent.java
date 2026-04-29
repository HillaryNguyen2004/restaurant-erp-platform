package com.hcmut.ordermenu.domain.events;

import lombok.Getter;

import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Getter
public abstract class DomainEvent {
	private final UUID eventId;
	private final Instant occurredAt;
	private final UUID aggregateId;

	protected DomainEvent(UUID aggregateId) {
		this.eventId = UUID.randomUUID();
		this.occurredAt = Instant.now();
		this.aggregateId = aggregateId;
	}

	public abstract String getEventType();

	public abstract Map<String, Object> toPayload();
}
