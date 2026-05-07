package com.hcmut.ordermenu.domain.events.order;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class OrderPlacedEvent extends DomainEvent {
    private final UUID orderSessionId;
    private final Instant orderTime;
    private final String status;
    private final BigDecimal subtotal;
    private final List<Map<String, Object>> orderItems;

    public OrderPlacedEvent(Order order) {
        super(order.getOrderId());
        this.orderSessionId = order.getOrderSessionId();
        this.orderTime = order.getOrderTime();
        this.status = order.getStatus().name();
        this.subtotal = order.calculateSubtotal();
        this.orderItems = order.getOrderItems().stream().map(this::toItemPayload).toList();
    }

    @Override
    public String getEventType() {
        return "order.placed";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", getAggregateId().toString());
        payload.put("orderSessionId", orderSessionId.toString());
        payload.put("orderTime", orderTime.toString());
        payload.put("status", status);
        payload.put("subtotal", subtotal);
        payload.put("items", orderItems);
        return payload;
    }

    private Map<String, Object> toItemPayload(OrderItem item) {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderItemId", item.getOrderItemId().toString());
        payload.put("menuItemId", item.getMenuItemId().toString());
        payload.put("quantity", item.getQuantity());
        payload.put("price", item.getPrice());
        payload.put("subtotal", item.subtotal());
        payload.put("modifiers", item.getModifiers());
        payload.put("specialInstructions", item.getSpecialInstructions());
        payload.put("menuItemName", item.getMenuItemName());
        payload.put("dishType", item.getDishType());
        payload.put("courseType", item.getCourseType());
        payload.put("allergyTags", item.getAllergyTags());
        payload.put("prepTimeMinutes", item.getPrepTimeMinutes());
        return payload;
    }
}
