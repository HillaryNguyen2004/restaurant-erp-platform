package com.hcmut.ordermenu.domain.entity;

import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;
import com.hcmut.ordermenu.domain.valueobject.TimeRange;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
public class OrderSession {
    private UUID orderSessionId;
    private UUID tableId;
    private OrderSessionStatus status;
    private TimeRange timeRange;

    private OrderSession(UUID tableId) {
        this.orderSessionId = UUID.randomUUID();
        this.tableId = tableId;
        this.status = OrderSessionStatus.ACTIVE;
        this.timeRange = new TimeRange(Instant.now(), null);
    }

    public static OrderSession create(UUID tableId) {
        return new OrderSession(tableId);
    }

    public static OrderSession restore(UUID orderSessionId, UUID tableId, OrderSessionStatus status, TimeRange timeRange) {
        OrderSession session = new OrderSession(tableId);
        session.orderSessionId = orderSessionId;
        session.status = status;
        session.timeRange = timeRange;
        return session;
    }

    public void close() {
        this.status = OrderSessionStatus.CLOSED;
        this.timeRange = new TimeRange(this.timeRange.getStartTime(), Instant.now());
    }

    public void cancel() {
        this.status = OrderSessionStatus.CANCELLED;
        this.timeRange = new TimeRange(this.timeRange.getStartTime(), Instant.now());
    }
}
