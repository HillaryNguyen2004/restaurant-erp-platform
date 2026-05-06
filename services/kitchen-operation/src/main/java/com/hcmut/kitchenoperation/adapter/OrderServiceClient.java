package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderCancelledPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderItemPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderItemUpdatedPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderPlacedPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderSessionPayload;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class OrderServiceClient {
    private final Map<String, OrderProjection> orderStore = new ConcurrentHashMap<>();
    private final Map<String, String> sessionTableStore = new ConcurrentHashMap<>();
    private final Map<String, Set<String>> sessionOrderStore = new ConcurrentHashMap<>();

    public OrderSnapshot getOrder(String orderId) {
        return getOrCreateProjection(orderId).snapshot();
    }

    public List<OrderItemSnapshot> getOrderItems(String orderId) {
        return getOrCreateProjection(orderId).snapshotItems();
    }

    public synchronized void applyOrderPlaced(String aggregateId, OrderPlacedPayload payload) {
        String orderId = defaultIfBlank(payload == null ? null : payload.orderId(), aggregateId);
        OrderProjection projection = getOrCreateProjection(orderId);
        String effectiveSessionId = defaultIfBlank(payload == null ? null : payload.orderSessionId(), projection.getOrderSessionId());
        projection.setOrderSessionId(effectiveSessionId);
        projection.setOrderStatus(defaultIfBlank(payload == null ? null : payload.status(), "PLACED"));
        projection.setSpecialInstructions(defaultIfBlank(projection.specialInstructions, ""));
        projection.setCreatedAt(parseInstant(payload == null ? null : payload.orderTime(), Instant.now()));
        projection.setTableNumber(resolveTableNumber(effectiveSessionId, orderId));

        if (effectiveSessionId != null && !effectiveSessionId.isBlank()) {
            sessionOrderStore.computeIfAbsent(effectiveSessionId, ignored -> new LinkedHashSet<>()).add(orderId);
        }

        projection.replaceItems(normalizeItems(payload == null ? null : payload.items()));
    }

    public synchronized void applyOrderItemUpdated(String aggregateId, OrderItemUpdatedPayload payload) {
        String orderId = defaultIfBlank(payload == null ? null : payload.orderId(), aggregateId);
        String orderItemId = payload == null ? null : payload.orderItemId();
        if (orderItemId == null || orderItemId.isBlank()) {
            return;
        }

        OrderProjection projection = getOrCreateProjection(orderId);
        OrderItemProjection item = projection.findItem(orderItemId);
        if (item == null) {
            item = defaultItem(
                    orderItemId,
                    payload == null ? null : payload.menuItemId(),
                    payload == null || payload.quantity() == null ? 1 : payload.quantity(),
                    payload == null ? null : payload.specialInstructions()
            );
            projection.addItem(item);
        }

        if (payload != null && payload.quantity() != null) {
            item.setQuantity(Math.max(1, payload.quantity()));
        }
        if (payload != null && payload.specialInstructions() != null) {
            item.setSpecialInstructions(payload.specialInstructions());
        }

        mergeItemMetadata(
                item,
                payload == null ? null : payload.menuItemId(),
                payload == null ? null : payload.menuItemName(),
                payload == null ? null : payload.dishType(),
                payload == null ? null : payload.courseType(),
                payload == null ? null : payload.allergyTags(),
                payload == null ? null : payload.prepTimeMinutes()
        );
    }

    public synchronized void applyOrderCancelled(String aggregateId, OrderCancelledPayload payload) {
        String orderId = defaultIfBlank(payload == null ? null : payload.orderId(), aggregateId);
        OrderProjection projection = getOrCreateProjection(orderId);
        projection.setOrderStatus(defaultIfBlank(payload == null ? null : payload.status(), "CANCELLED"));
        if (payload != null && payload.cancellationReason() != null) {
            projection.setSpecialInstructions(payload.cancellationReason());
        }
    }

    public synchronized void applyOrderSessionUpdated(String aggregateId, OrderSessionPayload payload) {
        String orderSessionId = defaultIfBlank(payload == null ? null : payload.orderSessionId(), aggregateId);
        if (orderSessionId == null || orderSessionId.isBlank()) {
            return;
        }

        String tableId = payload == null ? null : payload.tableId();
        if (tableId != null && !tableId.isBlank()) {
            sessionTableStore.put(orderSessionId, tableNumberFromId(tableId, orderSessionId));
        }

        Set<String> orderIds = sessionOrderStore.get(orderSessionId);
        if (orderIds == null || orderIds.isEmpty()) {
            orderIds = findOrdersBySession(orderSessionId);
        }

        if (orderIds == null || orderIds.isEmpty()) {
            return;
        }

        for (String orderId : orderIds) {
            OrderProjection projection = getOrCreateProjection(orderId);
            String tableNumber = sessionTableStore.get(orderSessionId);
            if (tableNumber != null && !tableNumber.isBlank()) {
                projection.setTableNumber(tableNumber);
            }

            String sessionStatus = payload == null ? null : payload.status();
            if (sessionStatus == null || sessionStatus.isBlank()) {
                continue;
            }

            if ("CANCELLED".equalsIgnoreCase(sessionStatus)) {
                projection.setOrderStatus("CANCELLED");
            }
        }
    }

    private OrderProjection getOrCreateProjection(String orderId) {
        return orderStore.computeIfAbsent(orderId, this::buildDefaultProjection);
    }

    private OrderProjection buildDefaultProjection(String orderId) {
        OrderProjection projection = new OrderProjection(orderId);
        projection.setTableNumber(tableNumberFromId(orderId, orderId));
        projection.setOrderStatus("PLACED");
        projection.setSpecialInstructions("Serve by course");
        projection.setCreatedAt(Instant.now());
        projection.replaceItems(defaultItems(orderId));
        return projection;
    }

    private Set<String> findOrdersBySession(String orderSessionId) {
        Set<String> orderIds = new LinkedHashSet<>();
        for (OrderProjection projection : orderStore.values()) {
            if (orderSessionId.equals(projection.getOrderSessionId())) {
                orderIds.add(projection.getOrderId());
            }
        }

        if (!orderIds.isEmpty()) {
            sessionOrderStore.put(orderSessionId, orderIds);
        }

        return orderIds;
    }

    private String resolveTableNumber(String orderSessionId, String orderId) {
        if (orderSessionId != null && !orderSessionId.isBlank()) {
            String tableNumber = sessionTableStore.get(orderSessionId);
            if (tableNumber != null && !tableNumber.isBlank()) {
                return tableNumber;
            }
        }
        return tableNumberFromId(orderId, orderId);
    }

    private String tableNumberFromId(String id, String fallbackId) {
        String source = defaultIfBlank(id, fallbackId);
        return "T-" + Math.abs(source.hashCode() % 30 + 1);
    }

    private List<OrderItemProjection> normalizeItems(List<OrderItemPayload> items) {
        if (items == null || items.isEmpty()) {
            return List.of();
        }

        List<OrderItemProjection> normalized = new ArrayList<>();
        for (OrderItemPayload raw : items) {
            normalized.add(normalizeOrderItem(raw));
        }
        return normalized;
    }

    private OrderItemProjection normalizeOrderItem(OrderItemPayload raw) {
        String menuItemId = raw == null ? "" : asString(raw.menuItemId());
        String orderItemId = defaultIfBlank(raw == null ? "" : asString(raw.orderItemId()), menuItemId);
        int quantity = raw == null ? 1 : defaultIfNull(raw.quantity(), 1);
        String specialInstructions = raw == null ? "" : asString(raw.specialInstructions());

        OrderItemProjection item = defaultItem(orderItemId, menuItemId, quantity, specialInstructions);
        mergeItemMetadata(
                item,
                raw == null ? null : raw.menuItemId(),
                raw == null ? null : raw.menuItemName(),
                raw == null ? null : raw.dishType(),
                raw == null ? null : raw.courseType(),
                raw == null ? null : raw.allergyTags(),
                raw == null ? null : raw.prepTimeMinutes()
        );
        return item;
    }

    private void mergeItemMetadata(
            OrderItemProjection item,
            String menuItemId,
            String menuItemName,
            String dishType,
            String courseType,
            List<String> allergyTags,
            Integer prepTimeMinutes
    ) {
        if (!asString(menuItemId).isBlank()) {
            item.setMenuItemId(menuItemId);
        }
        if (!asString(menuItemName).isBlank()) {
            item.setMenuItemName(menuItemName);
        }
        if (!asString(dishType).isBlank()) {
            item.setDishType(dishType);
        }
        if (!asString(courseType).isBlank()) {
            item.setCourseType(courseType);
        }
        if (allergyTags != null) {
            item.setAllergyTags(allergyTags);
        }
        if (prepTimeMinutes != null) {
            item.setPrepTimeMinutes(Math.max(1, prepTimeMinutes));
        }
    }

    private List<OrderItemProjection> defaultItems(String orderId) {
        List<OrderItemProjection> items = new ArrayList<>();
        items.add(item(orderId + "-1", "M-100", "Caesar Salad", "salad", "APPETIZER", 1, "No croutons", List.of("gluten"), 8));
        items.add(item(orderId + "-2", "M-200", "Ribeye Steak", "steak", "MAIN", 1, "Medium rare", List.of(), 18));
        items.add(item(orderId + "-3", "M-300", "Chocolate Cake", "dessert", "DESSERT", 1, "Birthday plate", List.of("dairy"), 6));
        return items;
    }

    private OrderItemProjection defaultItem(String orderItemId, String menuItemId, int quantity, String specialInstructions) {
        String resolvedItemId = defaultIfBlank(orderItemId, menuItemId);
        String resolvedMenuId = defaultIfBlank(menuItemId, resolvedItemId);
        String itemName = defaultItemName(resolvedMenuId, resolvedItemId);

        return item(
                resolvedItemId,
                resolvedMenuId,
                itemName,
                "unknown",
                "MAIN",
                Math.max(quantity, 1),
                defaultIfBlank(specialInstructions, ""),
                List.of(),
                10
        );
    }

    private String defaultItemName(String menuItemId, String orderItemId) {
        String base = defaultIfBlank(menuItemId, orderItemId);
        if (base == null || base.isBlank()) {
            return "Unknown Item";
        }
        return "Item " + base;
    }

    private OrderItemProjection item(
            String orderItemId,
            String menuItemId,
            String menuItemName,
            String dishType,
            String courseType,
            int quantity,
            String specialInstructions,
            List<String> allergyTags,
            int prepTimeMinutes
    ) {
        return new OrderItemProjection(
                orderItemId,
                menuItemId,
                menuItemName,
                dishType,
                courseType,
                quantity,
                specialInstructions,
                allergyTags,
                prepTimeMinutes
        );
    }

    private int defaultIfNull(Integer value, int fallback) {
        return value == null ? fallback : value;
    }

    private Instant parseInstant(String value, Instant fallback) {
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value)) {
            return fallback;
        }
        try {
            return Instant.parse(value);
        } catch (DateTimeParseException ex) {
            return fallback;
        }
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank() || "null".equalsIgnoreCase(value)) {
            return fallback;
        }
        return value;
    }

    public record OrderSnapshot(
            String orderId,
            String tableNumber,
            String orderStatus,
            String specialInstructions,
            Instant createdAt
    ) {
    }

    public record OrderItemSnapshot(
            String orderItemId,
            String menuItemId,
            String menuItemName,
            String dishType,
            String courseType,
            int quantity,
            String specialInstructions,
            List<String> allergyTags,
            int prepTimeMinutes
    ) {
    }

    private static final class OrderProjection {
        private final String orderId;
        private String orderSessionId;
        private String tableNumber;
        private String orderStatus;
        private String specialInstructions;
        private Instant createdAt;
        private final List<OrderItemProjection> items = new ArrayList<>();

        private OrderProjection(String orderId) {
            this.orderId = orderId;
        }

        private OrderSnapshot snapshot() {
            return new OrderSnapshot(orderId, tableNumber, orderStatus, specialInstructions, createdAt);
        }

        private List<OrderItemSnapshot> snapshotItems() {
            return items.stream().map(OrderItemProjection::snapshot).toList();
        }

        private void replaceItems(List<OrderItemProjection> updated) {
            items.clear();
            if (updated != null) {
                items.addAll(updated);
            }
        }

        private void addItem(OrderItemProjection item) {
            if (item != null) {
                items.add(item);
            }
        }

        private OrderItemProjection findItem(String orderItemId) {
            for (OrderItemProjection item : items) {
                if (orderItemId.equals(item.getOrderItemId())) {
                    return item;
                }
            }
            return null;
        }

        private String getOrderId() {
            return orderId;
        }

        private String getOrderSessionId() {
            return orderSessionId;
        }

        private void setOrderSessionId(String orderSessionId) {
            this.orderSessionId = orderSessionId;
        }

        private void setTableNumber(String tableNumber) {
            this.tableNumber = tableNumber;
        }

        private void setOrderStatus(String orderStatus) {
            this.orderStatus = orderStatus;
        }

        private void setSpecialInstructions(String specialInstructions) {
            this.specialInstructions = specialInstructions;
        }

        private void setCreatedAt(Instant createdAt) {
            this.createdAt = createdAt;
        }
    }

    private static final class OrderItemProjection {
        private final String orderItemId;
        private String menuItemId;
        private String menuItemName;
        private String dishType;
        private String courseType;
        private int quantity;
        private String specialInstructions;
        private List<String> allergyTags;
        private int prepTimeMinutes;

        private OrderItemProjection(
                String orderItemId,
                String menuItemId,
                String menuItemName,
                String dishType,
                String courseType,
                int quantity,
                String specialInstructions,
                List<String> allergyTags,
                int prepTimeMinutes
        ) {
            this.orderItemId = orderItemId;
            this.menuItemId = menuItemId;
            this.menuItemName = menuItemName;
            this.dishType = dishType;
            this.courseType = courseType;
            this.quantity = quantity;
            this.specialInstructions = specialInstructions;
            this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
            this.prepTimeMinutes = prepTimeMinutes;
        }

        private OrderItemSnapshot snapshot() {
            return new OrderItemSnapshot(
                    orderItemId,
                    menuItemId,
                    menuItemName,
                    dishType,
                    courseType,
                    quantity,
                    specialInstructions,
                    List.copyOf(allergyTags),
                    prepTimeMinutes
            );
        }

        private String getOrderItemId() {
            return orderItemId;
        }

        private int getPrepTimeMinutes() {
            return prepTimeMinutes;
        }

        private void setMenuItemId(String menuItemId) {
            this.menuItemId = menuItemId;
        }

        private void setMenuItemName(String menuItemName) {
            this.menuItemName = menuItemName;
        }

        private void setDishType(String dishType) {
            this.dishType = dishType;
        }

        private void setCourseType(String courseType) {
            this.courseType = courseType;
        }

        private void setQuantity(int quantity) {
            this.quantity = quantity;
        }

        private void setSpecialInstructions(String specialInstructions) {
            this.specialInstructions = specialInstructions;
        }

        private void setAllergyTags(List<String> allergyTags) {
            this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
        }

        private void setPrepTimeMinutes(int prepTimeMinutes) {
            this.prepTimeMinutes = prepTimeMinutes;
        }
    }
}
