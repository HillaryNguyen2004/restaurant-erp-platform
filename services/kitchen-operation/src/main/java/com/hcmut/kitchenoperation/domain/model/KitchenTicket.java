package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Getter
public class KitchenTicket {
    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_IN_PROGRESS = "IN_PROGRESS";
    public static final String STATUS_READY = "READY";
    public static final String STATUS_COMPLETED = "COMPLETED";
    public static final String STATUS_CANCELLED = "CANCELLED";

    private final String id;
    private final String orderId;
    private final String tableNumber;
    private final String stationId;
    private final List<TicketItem> items;
    private final String courseType;
    private String status;
    private int priority;
    private final int prepTimeMinutes;
    private final String specialInstructions;
    private final Instant createdAt;
    private Instant startedAt;
    private Instant completedAt;

    public KitchenTicket(
            String orderId,
            String tableNumber,
            String stationId,
            List<TicketItem> items,
            String courseType,
            int prepTimeMinutes,
            String specialInstructions
    ) {
        this.id = UUID.randomUUID().toString();
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.stationId = stationId;
        this.items = new ArrayList<>(items == null ? List.of() : items);
        this.courseType = courseType;
        this.status = STATUS_PENDING;
        this.priority = 0;
        this.prepTimeMinutes = Math.max(1, prepTimeMinutes);
        this.specialInstructions = specialInstructions;
        this.createdAt = Instant.now();
    }

    private KitchenTicket(
            String id,
            String orderId,
            String tableNumber,
            String stationId,
            List<TicketItem> items,
            String courseType,
            String status,
            int priority,
            int prepTimeMinutes,
            String specialInstructions,
            Instant createdAt,
            Instant startedAt,
            Instant completedAt
    ) {
        this.id = id;
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.stationId = stationId;
        this.items = new ArrayList<>(items == null ? List.of() : items);
        this.courseType = courseType;
        this.status = status;
        this.priority = Math.max(0, priority);
        this.prepTimeMinutes = Math.max(1, prepTimeMinutes);
        this.specialInstructions = specialInstructions;
        this.createdAt = createdAt;
        this.startedAt = startedAt;
        this.completedAt = completedAt;
    }

    public static KitchenTicket restore(
            String id,
            String orderId,
            String tableNumber,
            String stationId,
            List<TicketItem> items,
            String courseType,
            String status,
            int priority,
            int prepTimeMinutes,
            String specialInstructions,
            Instant createdAt,
            Instant startedAt,
            Instant completedAt
    ) {
        return new KitchenTicket(
                id,
                orderId,
                tableNumber,
                stationId,
                items,
                courseType,
                status,
                priority,
                prepTimeMinutes,
                specialInstructions,
                createdAt,
                startedAt,
                completedAt
        );
    }

    public void changeStatus(String newStatus, Instant timestamp) {
        if (!canTransitionTo(newStatus)) {
            throw new IllegalStateException("Invalid ticket status transition: " + status + " -> " + newStatus);
        }

        this.status = newStatus;
        if (STATUS_IN_PROGRESS.equals(newStatus) && startedAt == null) {
            startedAt = timestamp;
        }
        if ((STATUS_COMPLETED.equals(newStatus) || STATUS_CANCELLED.equals(newStatus)) && completedAt == null) {
            completedAt = timestamp;
        }
    }

    public void setPriority(int priority) {
        this.priority = Math.max(0, priority);
    }

    public long calculateElapsedMinutes(Instant currentTime) {
        Instant effectiveEnd = completedAt != null && completedAt.isBefore(currentTime) ? completedAt : currentTime;
        return Math.max(0, Duration.between(createdAt, effectiveEnd).toMinutes());
    }

    public long calculateRemainingMinutes(Instant currentTime) {
        return Math.max(0, prepTimeMinutes - calculateElapsedMinutes(currentTime));
    }

    public Instant getEstimatedCompletionTime() {
        Instant base = startedAt == null ? createdAt : startedAt;
        return base.plus(Duration.ofMinutes(prepTimeMinutes));
    }

    public boolean hasAllergyAlert() {
        return items.stream().anyMatch(TicketItem::hasAllergyTags);
    }

    public boolean isOverdue(Instant currentTime) {
        return isActive() && calculateElapsedMinutes(currentTime) > prepTimeMinutes;
    }

    public boolean isActive() {
        return !STATUS_COMPLETED.equals(status) && !STATUS_CANCELLED.equals(status);
    }

    public boolean canTransitionTo(String newStatus) {
        String target = newStatus == null ? "" : newStatus.toUpperCase(Locale.ROOT);
        return switch (status) {
            case STATUS_PENDING -> STATUS_IN_PROGRESS.equals(target) || STATUS_CANCELLED.equals(target);
            case STATUS_IN_PROGRESS -> STATUS_READY.equals(target) || STATUS_COMPLETED.equals(target) || STATUS_CANCELLED.equals(target);
            case STATUS_READY -> STATUS_COMPLETED.equals(target) || STATUS_IN_PROGRESS.equals(target) || STATUS_CANCELLED.equals(target);
            case STATUS_COMPLETED, STATUS_CANCELLED -> false;
            default -> false;
        };
    }
}
