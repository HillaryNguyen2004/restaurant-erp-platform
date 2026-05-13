package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderCancelledEvent;
import com.hcmut.ordermenu.domain.events.order.OrderPlacedEvent;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderEventPublisher Tests")
class OrderEventPublisherTest {

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    private OrderEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new OrderEventPublisher(domainEventPublisher, webSocketNotificationService);
    }

    @Test
    @DisplayName("Should publish OrderPlacedEvent")
    void publishOrderPlaced() {
        Order order = new Order(
                UUID.randomUUID(),
                List.of(new OrderItem(UUID.randomUUID(), 2, BigDecimal.valueOf(8), List.of("less sugar"), "warm"))
        );

        publisher.publishOrderPlaced(order);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(OrderPlacedEvent.class, event);
        assertEquals("order.placed", event.getEventType());
        verify(webSocketNotificationService).notifyOrderEvent(event);
    }

    @Test
    @DisplayName("Should publish OrderCancelledEvent")
    void publishOrderCancelled() {
        Order order = new Order(
                UUID.randomUUID(),
                List.of(new OrderItem(UUID.randomUUID(), 1, BigDecimal.valueOf(12), List.of(), null))
        );
        order.cancel("guest request");

        publisher.publishOrderCancelled(order);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(OrderCancelledEvent.class, event);
        assertEquals("order.cancelled", event.getEventType());
        assertEquals("guest request", event.toPayload().get("cancellationReason"));
        verify(webSocketNotificationService).notifyOrderEvent(event);
    }

    @Test
    @DisplayName("Should publish OrderStatusChangedEvent")
    void publishOrderStatusChanged() {
        Order order = new Order(
                UUID.randomUUID(),
                List.of(new OrderItem(UUID.randomUUID(), 1, BigDecimal.valueOf(12), List.of(), null))
        );
        order.markReady();

        publisher.publishOrderStatusChanged(order, "PREPARING", "ticket-1");

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertEquals("order.status.changed", event.getEventType());
        assertEquals("PREPARING", event.toPayload().get("oldStatus"));
        assertEquals("READY", event.toPayload().get("newStatus"));
        assertEquals("ticket-1", event.toPayload().get("sourceTicketId"));
        verify(webSocketNotificationService).notifyOrderEvent(event);
    }
}
