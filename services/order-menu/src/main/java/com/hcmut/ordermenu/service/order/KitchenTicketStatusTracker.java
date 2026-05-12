package com.hcmut.ordermenu.service.order;

import com.hcmut.ordermenu.domain.enums.OrderStatus;
import org.springframework.stereotype.Component;

import java.util.Collection;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class KitchenTicketStatusTracker {
    private final Map<UUID, Map<String, String>> ticketStatusesByOrder = new ConcurrentHashMap<>();

    public void registerTicket(String orderId, String ticketId) {
        UUID orderUuid = parseOrderId(orderId);
        if (orderUuid == null || ticketId == null || ticketId.isBlank()) {
            return;
        }

        ticketStatusesByOrder
                .computeIfAbsent(orderUuid, ignored -> new ConcurrentHashMap<>())
                .putIfAbsent(ticketId, "PENDING");
    }

    public OrderStatus updateTicketStatus(String orderId, String ticketId, String newStatus) {
        UUID orderUuid = parseOrderId(orderId);
        if (orderUuid == null || ticketId == null || ticketId.isBlank()) {
            return null;
        }

        Map<String, String> statuses = ticketStatusesByOrder.computeIfAbsent(orderUuid, ignored -> new ConcurrentHashMap<>());
        statuses.put(ticketId, normalize(newStatus));
        return resolveOrderStatus(statuses.values());
    }

    private OrderStatus resolveOrderStatus(Collection<String> statuses) {
        if (statuses == null || statuses.isEmpty()) {
            return null;
        }

        boolean allCancelled = statuses.stream().allMatch("CANCELLED"::equals);
        if (allCancelled) {
            return OrderStatus.CANCELLED;
        }

        boolean allComplete = statuses.stream().allMatch(status -> "READY".equals(status) || "COMPLETED".equals(status));
        if (allComplete) {
            return OrderStatus.READY;
        }

        boolean allPending = statuses.stream().allMatch(status -> "PENDING".equals(status));
        if (allPending) {
            return OrderStatus.PLACED;
        }

        return OrderStatus.PREPARING;
    }

    private UUID parseOrderId(String orderId) {
        try {
            return UUID.fromString(orderId);
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private String normalize(String status) {
        return status == null ? "" : status.trim().toUpperCase();
    }
}
