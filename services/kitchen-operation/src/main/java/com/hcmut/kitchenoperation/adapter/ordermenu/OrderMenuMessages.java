package com.hcmut.kitchenoperation.adapter.ordermenu;

import java.math.BigDecimal;
import java.util.List;

public final class OrderMenuMessages {
    private OrderMenuMessages() {
    }

    public record OrderPlacedMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            OrderPlacedPayload data
    ) {
    }

    public record OrderPlacedPayload(
            String orderId,
            String orderSessionId,
            String orderTime,
            String status,
            BigDecimal subtotal,
            List<OrderItemPayload> items
    ) {
    }

    public record OrderItemPayload(
            String orderItemId,
            String menuItemId,
            Integer quantity,
            BigDecimal price,
            BigDecimal subtotal,
            List<String> modifiers,
            String specialInstructions,
            String menuItemName,
            String dishType,
            String courseType,
            List<String> allergyTags,
            Integer prepTimeMinutes
    ) {
    }

    public record OrderItemUpdatedMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            OrderItemUpdatedPayload data
    ) {
    }

    public record OrderItemUpdatedPayload(
            String orderId,
            String orderSessionId,
            String orderItemId,
            String menuItemId,
            Integer quantity,
            List<String> modifiers,
            String specialInstructions,
            String menuItemName,
            String dishType,
            String courseType,
            List<String> allergyTags,
            Integer prepTimeMinutes
    ) {
    }

    public record OrderCancelledMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            OrderCancelledPayload data
    ) {
    }

    public record OrderCancelledPayload(
            String orderId,
            String orderSessionId,
            String status,
            String cancellationReason
    ) {
    }

    public record OrderSessionMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            OrderSessionPayload data
    ) {
    }

    public record OrderSessionPayload(
            String orderSessionId,
            String tableId,
            String status,
            String startTime,
            String endTime
    ) {
    }
}
