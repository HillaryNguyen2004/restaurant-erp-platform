package com.hcmut.kitchenoperation.domain.events;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

public class CourseFiredEvent extends DomainEvent {
    private final String orderId;
    private final String tableNumber;
    private final String courseType;
    private final List<String> ticketIds;
    private final String firedByUserId;

    public CourseFiredEvent(String orderId, String tableNumber, String courseType, List<String> ticketIds, String firedByUserId) {
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.courseType = courseType;
        this.ticketIds = new ArrayList<>(ticketIds == null ? List.of() : ticketIds);
        this.firedByUserId = firedByUserId;
    }

    @Override
    public String getEventType() {
        return "kitchen.course.fired";
    }

    @Override
    public String getAggregateId() {
        return orderId;
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", orderId);
        payload.put("tableNumber", tableNumber);
        payload.put("courseType", courseType);
        payload.put("ticketIds", ticketIds);
        payload.put("firedByUserId", firedByUserId);
        payload.put("occurredAt", getOccurredAt().toString());
        return payload;
    }
}
