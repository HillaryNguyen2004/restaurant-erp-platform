package com.hcmut.ordermenu.domain.entity;

import com.hcmut.ordermenu.domain.enums.OrderStatus;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
public class Order {
    private UUID orderId;
    private UUID orderSessionId;
    private Instant orderTime;
    private OrderStatus status;
    private List<OrderItem> orderItems;
    private String cancellationReason;

    public Order(UUID orderSessionId, List<OrderItem> orderItems) {
        this.orderId = UUID.randomUUID();
        this.orderSessionId = orderSessionId;
        this.orderTime = Instant.now();
        this.status = OrderStatus.PLACED;
        this.orderItems = new ArrayList<>(orderItems == null ? List.of() : orderItems);
    }

    public static Order restore(
            UUID orderId,
            UUID orderSessionId,
            Instant orderTime,
            OrderStatus status,
            List<OrderItem> orderItems,
            String cancellationReason
    ) {
        Order order = new Order(orderSessionId, orderItems);
        order.orderId = orderId;
        order.orderTime = orderTime;
        order.status = status;
        order.cancellationReason = cancellationReason;
        return order;
    }

    public void addOrderItem(UUID menuItemId, Integer quantity, BigDecimal price, String specialInstructions) {
        OrderItem orderItem = new OrderItem(menuItemId, quantity, price, specialInstructions);
        this.orderItems.add(orderItem);
    }

    public void removeOrderItem(UUID orderItemId) {
        this.orderItems.removeIf(item -> item.getOrderItemId().equals(orderItemId));
    }

    public void updateOrderItem(UUID orderItemId, Integer quantity, List<String> modifiers, String specialInstructions) {
        for (OrderItem item : orderItems) {
            if (item.getOrderItemId().equals(orderItemId)) {
                item.update(quantity, modifiers, specialInstructions);
                return;
            }
        }

        throw new IllegalArgumentException("Order item not found: " + orderItemId);
    }

    public void markPreparing() {
        this.status = OrderStatus.PREPARING;
    }

    public void markReady() {
        this.status = OrderStatus.READY;
    }

    public void markServed() {
        this.status = OrderStatus.SERVED;
    }

    public void cancel(String reason) {
        this.status = OrderStatus.CANCELLED;
        this.cancellationReason = reason;
    }

    public BigDecimal calculateSubtotal() {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (OrderItem item : orderItems) {
            subtotal = subtotal.add(item.subtotal());
        }
        return subtotal;
    }
}
