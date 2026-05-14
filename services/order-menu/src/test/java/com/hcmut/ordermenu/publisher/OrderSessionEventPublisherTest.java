package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderSessionClosedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderSessionStartedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderSessionEventPublisher Tests")
class OrderSessionEventPublisherTest {

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    private OrderSessionEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new OrderSessionEventPublisher(domainEventPublisher, webSocketNotificationService);
    }

    @Test
    @DisplayName("Should publish OrderSessionStartedEvent")
    void publishOrderSessionStarted() {
        OrderSession session = OrderSession.create(UUID.randomUUID());

        publisher.publishOrderSessionStarted(session);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(OrderSessionStartedEvent.class, event);
        assertEquals("order.session.started", event.getEventType());
        verify(webSocketNotificationService).notifyOrderEvent(event);
    }

    @Test
    @DisplayName("Should publish OrderSessionClosedEvent")
    void publishOrderSessionClosed() {
        OrderSession session = OrderSession.create(UUID.randomUUID());
        session.close();

        publisher.publishOrderSessionClosed(session);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(OrderSessionClosedEvent.class, event);
        assertEquals("order.session.closed", event.getEventType());
        verify(webSocketNotificationService).notifyOrderEvent(event);
    }
}
