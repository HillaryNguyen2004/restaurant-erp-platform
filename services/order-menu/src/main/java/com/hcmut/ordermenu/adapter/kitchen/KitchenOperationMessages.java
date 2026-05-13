package com.hcmut.ordermenu.adapter.kitchen;

public final class KitchenOperationMessages {
    private KitchenOperationMessages() {
    }

    public record TicketCreatedMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            TicketCreatedPayload data
    ) {
    }

    public record TicketCreatedPayload(
            String ticketId,
            String orderId,
            String tableNumber,
            String stationId,
            String courseType,
            Boolean hasAllergyAlert,
            String occurredAt
    ) {
    }

    public record TicketStatusChangedMessage(
            String eventId,
            String eventType,
            String occurredAt,
            String aggregateId,
            TicketStatusChangedPayload data
    ) {
    }

    public record TicketStatusChangedPayload(
            String ticketId,
            String orderId,
            String stationId,
            String oldStatus,
            String newStatus,
            String changedByUserId,
            String occurredAt
    ) {
    }
}
