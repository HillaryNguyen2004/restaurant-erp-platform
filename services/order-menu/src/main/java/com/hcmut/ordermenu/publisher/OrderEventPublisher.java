package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderCancelledEvent;
import com.hcmut.ordermenu.domain.events.order.OrderItemUpdatedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderPlacedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OrderEventPublisher {
    private final DomainEventPublisher domainEventPublisher;

    public void publishOrderPlaced(Order order) {
        domainEventPublisher.publish(new OrderPlacedEvent(order));
    }

    public void publishOrderItemUpdated(Order order, UUID itemId) {
        domainEventPublisher.publish(new OrderItemUpdatedEvent(order, itemId));
    }

    public void publishOrderCancelled(Order order) {
        domainEventPublisher.publish(new OrderCancelledEvent(order));
    }
}