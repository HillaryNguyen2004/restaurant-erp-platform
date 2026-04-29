package com.hcmut.ordermenu.domain.events.order;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class OrderCancelledEvent extends DomainEvent {
    private final UUID orderSessionId;
    private final String status;
    private final String cancellationReason;

    public OrderCancelledEvent(Order order) {
        super(order.getOrderId());
        this.orderSessionId = order.getOrderSessionId();
        this.status = order.getStatus().name();
        this.cancellationReason = order.getCancellationReason();
    }

    @Override
    public String getEventType() {
        return "order.cancelled";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", getAggregateId().toString());
        payload.put("orderSessionId", orderSessionId.toString());
        payload.put("status", status);
        payload.put("cancellationReason", cancellationReason);
        return payload;
    }
}