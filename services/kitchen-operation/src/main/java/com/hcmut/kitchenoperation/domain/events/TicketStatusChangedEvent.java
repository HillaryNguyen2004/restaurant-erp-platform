package com.hcmut.kitchenoperation.domain.events;

import java.util.LinkedHashMap;
import java.util.Map;

public class TicketStatusChangedEvent extends DomainEvent {
    private final String ticketId;
    private final String orderId;
    private final String oldStatus;
    private final String newStatus;
    private final String changedByUserId;

    public TicketStatusChangedEvent(String ticketId, String orderId, String oldStatus, String newStatus, String changedByUserId) {
        this.ticketId = ticketId;
        this.orderId = orderId;
        this.oldStatus = oldStatus;
        this.newStatus = newStatus;
        this.changedByUserId = changedByUserId;
    }

    @Override
    public String getEventType() {
        return "kitchen.ticket.status.changed";
    }

    @Override
    public String getAggregateId() {
        return ticketId;
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("ticketId", ticketId);
        payload.put("orderId", orderId);
        payload.put("oldStatus", oldStatus);
        payload.put("newStatus", newStatus);
        payload.put("changedByUserId", changedByUserId);
        payload.put("occurredAt", getOccurredAt().toString());
        return payload;
    }
}
