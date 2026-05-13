package com.hcmut.ordermenu.adapter.kitchen;

import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketCreatedPayload;
import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketCreatedMessage;
import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketStatusChangedMessage;
import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketStatusChangedPayload;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.enums.OrderStatus;
import com.hcmut.ordermenu.publisher.OrderEventPublisher;
import com.hcmut.ordermenu.repository.InMemoryOrderRepository;
import com.hcmut.ordermenu.service.order.KitchenTicketStatusTracker;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.times;

@ExtendWith(MockitoExtension.class)
@DisplayName("KitchenOperationEventListener Tests")
class KitchenOperationEventListenerTest {
    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    private InMemoryOrderRepository orderRepository;
    private KitchenOperationEventListener listener;

    @BeforeEach
    void setUp() {
        orderRepository = new InMemoryOrderRepository();
        OrderEventPublisher orderEventPublisher = new OrderEventPublisher(domainEventPublisher, webSocketNotificationService);
        listener = new KitchenOperationEventListener(
                JsonMapper.builder().build(),
                orderRepository,
                orderEventPublisher,
                new KitchenTicketStatusTracker()
        );
    }

    @Test
    @DisplayName("Should translate kitchen ticket status into order status updates")
    void shouldUpdateOrderStatusFromKitchenEvents() {
        UUID orderId = UUID.randomUUID();
        Order order = new Order(
                UUID.randomUUID(),
                List.of(new OrderItem(UUID.randomUUID(), 2, BigDecimal.valueOf(8), List.of(), null))
        );
        order = Order.restore(
                orderId,
                order.getOrderSessionId(),
                order.getOrderTime(),
                OrderStatus.PLACED,
                order.getOrderItems(),
                null
        );
        orderRepository.save(order);

        listener.onKitchenEvent("kitchen.ticket.created", """
                {
                  "eventId": "evt-1",
                  "eventType": "kitchen.ticket.created",
                  "occurredAt": "2026-04-28T10:00:00Z",
                  "aggregateId": "ticket-1",
                  "data": {
                    "ticketId": "ticket-1",
                    "orderId": "%s",
                    "tableNumber": "T-1",
                    "stationId": "station-1",
                    "courseType": "MAIN",
                    "hasAllergyAlert": false,
                    "occurredAt": "2026-04-28T10:00:00Z"
                  }
                }
                """.formatted(orderId));

        listener.onKitchenEvent("kitchen.ticket.status.changed", """
                {
                  "eventId": "evt-2",
                  "eventType": "kitchen.ticket.status.changed",
                  "occurredAt": "2026-04-28T10:02:00Z",
                  "aggregateId": "ticket-1",
                  "data": {
                    "ticketId": "ticket-1",
                    "orderId": "%s",
                    "stationId": "station-1",
                    "oldStatus": "PENDING",
                    "newStatus": "IN_PROGRESS",
                    "changedByUserId": "user-1",
                    "occurredAt": "2026-04-28T10:02:00Z"
                  }
                }
                """.formatted(orderId));

        listener.onKitchenEvent("kitchen.ticket.status.changed", """
                {
                  "eventId": "evt-3",
                  "eventType": "kitchen.ticket.status.changed",
                  "occurredAt": "2026-04-28T10:10:00Z",
                  "aggregateId": "ticket-1",
                  "data": {
                    "ticketId": "ticket-1",
                    "orderId": "%s",
                    "stationId": "station-1",
                    "oldStatus": "IN_PROGRESS",
                    "newStatus": "READY",
                    "changedByUserId": "user-1",
                    "occurredAt": "2026-04-28T10:10:00Z"
                  }
                }
                """.formatted(orderId));

        Order updated = orderRepository.findById(orderId);
        assertEquals(OrderStatus.READY, updated.getStatus());

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher, times(2)).publish(captor.capture());
        assertEquals(2, captor.getAllValues().size());
        DomainEvent latest = captor.getAllValues().getLast();
        assertEquals("order.status.changed", latest.getEventType());
        assertEquals("PREPARING", latest.toPayload().get("oldStatus"));
        assertEquals("READY", latest.toPayload().get("newStatus"));
        verify(webSocketNotificationService, times(2)).notifyOrderEvent(any());
    }

    @Test
    @DisplayName("Should ignore malformed kitchen payload")
    void shouldIgnoreMalformedKitchenPayload() {
        listener.onKitchenEvent("kitchen.ticket.status.changed", "{invalid-json");

        verifyNoInteractions(domainEventPublisher);
        verifyNoInteractions(webSocketNotificationService);
    }
}
