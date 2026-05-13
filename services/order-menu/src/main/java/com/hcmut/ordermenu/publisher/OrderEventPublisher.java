package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderCancelledEvent;
import com.hcmut.ordermenu.domain.events.order.OrderItemUpdatedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderPlacedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderStatusChangedEvent;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final DomainEventPublisher domainEventPublisher;
    private final WebSocketNotificationService webSocketNotificationService;

    public void publishOrderPlaced(Order order) {
        publish(new OrderPlacedEvent(order));
    }

    public void publishOrderItemUpdated(Order order, UUID itemId) {
        publish(new OrderItemUpdatedEvent(order, itemId));
    }

    public void publishOrderCancelled(Order order) {
        publish(new OrderCancelledEvent(order));
    }

    public void publishOrderStatusChanged(Order order, String oldStatus, String sourceTicketId) {
        publish(new OrderStatusChangedEvent(order, oldStatus, sourceTicketId));
    }

    private void publish(com.hcmut.ordermenu.domain.events.DomainEvent event) {
        domainEventPublisher.publish(event);
        webSocketNotificationService.notifyOrderEvent(event);
    }
}
