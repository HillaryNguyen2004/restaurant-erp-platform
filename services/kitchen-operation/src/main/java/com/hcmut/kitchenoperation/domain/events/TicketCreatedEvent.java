package com.hcmut.kitchenoperation.domain.events;

import com.hcmut.kitchenoperation.domain.model.KitchenTicket;

import java.util.LinkedHashMap;
import java.util.Map;

public class TicketCreatedEvent extends DomainEvent {
    private final String ticketId;
    private final String orderId;
    private final String tableNumber;
    private final String stationId;
    private final String courseType;
    private final boolean hasAllergyAlert;

    public TicketCreatedEvent(KitchenTicket ticket) {
        this.ticketId = ticket.getId();
        this.orderId = ticket.getOrderId();
        this.tableNumber = ticket.getTableNumber();
        this.stationId = ticket.getStationId();
        this.courseType = ticket.getCourseType();
        this.hasAllergyAlert = ticket.hasAllergyAlert();
    }

    @Override
    public String getEventType() {
        return "kitchen.ticket.created";
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
        payload.put("tableNumber", tableNumber);
        payload.put("stationId", stationId);
        payload.put("courseType", courseType);
        payload.put("hasAllergyAlert", hasAllergyAlert);
        payload.put("occurredAt", getOccurredAt().toString());
        return payload;
    }
}
