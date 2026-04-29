package com.hcmut.ordermenu.domain.events.order;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class OrderSessionStartedEvent extends DomainEvent {
    private final UUID tableId;
    private final String status;
    private final Instant startTime;

    public OrderSessionStartedEvent(OrderSession session) {
        super(session.getOrderSessionId());
        this.tableId = session.getTableId();
        this.status = session.getStatus().name();
        this.startTime = session.getTimeRange().getStartTime();
    }

    @Override
    public String getEventType() {
        return "order.session.started";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderSessionId", getAggregateId().toString());
        payload.put("tableId", tableId.toString());
        payload.put("status", status);
        payload.put("startTime", startTime.toString());
        return payload;
    }
}