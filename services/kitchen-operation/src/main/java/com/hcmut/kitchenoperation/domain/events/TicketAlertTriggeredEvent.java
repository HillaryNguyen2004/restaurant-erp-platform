package com.hcmut.kitchenoperation.domain.events;

import com.hcmut.kitchenoperation.domain.model.TicketAlert;

import java.util.LinkedHashMap;
import java.util.Map;

public class TicketAlertTriggeredEvent extends DomainEvent {
    private final String ticketId;
    private final String stationId;
    private final String alertLevel;
    private final long remainingMinutes;

    public TicketAlertTriggeredEvent(TicketAlert alert) {
        this.ticketId = alert.getTicketId();
        this.stationId = alert.getStationId();
        this.alertLevel = alert.getAlertLevel();
        this.remainingMinutes = alert.getRemainingMinutes();
    }

    @Override
    public String getEventType() {
        return "kitchen.ticket.alert.triggered";
    }

    @Override
    public String getAggregateId() {
        return ticketId;
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("ticketId", ticketId);
        payload.put("stationId", stationId);
        payload.put("alertLevel", alertLevel);
        payload.put("remainingMinutes", remainingMinutes);
        payload.put("occurredAt", getOccurredAt().toString());
        return payload;
    }
}
