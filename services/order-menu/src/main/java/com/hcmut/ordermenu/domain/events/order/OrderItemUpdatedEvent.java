package com.hcmut.ordermenu.domain.events.order;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class OrderItemUpdatedEvent extends DomainEvent {
    private final UUID orderSessionId;
    private final UUID orderItemId;
    private final Integer quantity;
    private final List<String> modifiers;
    private final String specialInstructions;
    private final UUID menuItemId;
    private final String menuItemName;
    private final String dishType;
    private final String courseType;
    private final List<String> allergyTags;
    private final Integer prepTimeMinutes;

    public OrderItemUpdatedEvent(Order order, UUID orderItemId) {
        super(order.getOrderId());
        this.orderSessionId = order.getOrderSessionId();
        this.orderItemId = orderItemId;

        OrderItem updatedItem = order.getOrderItems().stream()
                .filter(item -> item.getOrderItemId().equals(orderItemId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Order item not found: " + orderItemId));

        this.quantity = updatedItem.getQuantity();
        this.modifiers = new ArrayList<>(updatedItem.getModifiers());
        this.specialInstructions = updatedItem.getSpecialInstructions();
        this.menuItemId = updatedItem.getMenuItemId();
        this.menuItemName = updatedItem.getMenuItemName();
        this.dishType = updatedItem.getDishType();
        this.courseType = updatedItem.getCourseType();
        this.allergyTags = new ArrayList<>(updatedItem.getAllergyTags());
        this.prepTimeMinutes = updatedItem.getPrepTimeMinutes();
    }

    @Override
    public String getEventType() {
        return "order.item.updated";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("orderId", getAggregateId().toString());
        payload.put("orderSessionId", orderSessionId.toString());
        payload.put("orderItemId", orderItemId.toString());
        payload.put("menuItemId", menuItemId.toString());
        payload.put("quantity", quantity);
        payload.put("modifiers", modifiers);
        payload.put("specialInstructions", specialInstructions);
        payload.put("menuItemName", menuItemName);
        payload.put("dishType", dishType);
        payload.put("courseType", courseType);
        payload.put("allergyTags", allergyTags);
        payload.put("prepTimeMinutes", prepTimeMinutes);
        return payload;
    }
}
