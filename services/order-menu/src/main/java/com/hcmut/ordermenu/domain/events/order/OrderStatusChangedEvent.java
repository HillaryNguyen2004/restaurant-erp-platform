package com.hcmut.ordermenu.domain.events.order;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class OrderStatusChangedEvent extends DomainEvent {
    private final UUID orderSessionId;
    private final String oldStatus;
    private final String newStatus;
    private final String sourceTicketId;

    public OrderStatusChangedEvent(Order order, String oldStatus, String sourceTicketId) {
        super(order.getOrderId());
        this.orderSessionId = order.getOrderSessionId();
        this.oldStatus = oldStatus;
        this.newStatus = order.getStatus().name();
        this.sourceTicketId = sourceTicketId;
    }

    @Override
    public String getEventType() {
        return "order.status.changed";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", getAggregateId().toString());
        payload.put("orderSessionId", orderSessionId.toString());
        payload.put("oldStatus", oldStatus);
        payload.put("newStatus", newStatus);
        payload.put("sourceTicketId", sourceTicketId);
        return payload;
    }
}
