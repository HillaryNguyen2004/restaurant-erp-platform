package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderSessionCancelledEvent;
import com.hcmut.ordermenu.domain.events.order.OrderSessionClosedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderSessionStartedEvent;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderSessionEventPublisher {
    private final DomainEventPublisher domainEventPublisher;
    private final WebSocketNotificationService webSocketNotificationService;

    public void publishOrderSessionStarted(OrderSession session) {
        publish(new OrderSessionStartedEvent(session));
    }

    public void publishOrderSessionClosed(OrderSession session) {
        publish(new OrderSessionClosedEvent(session));
    }

    public void publishOrderSessionCancelled(OrderSession session) {
        publish(new OrderSessionCancelledEvent(session));
    }

    private void publish(com.hcmut.ordermenu.domain.events.DomainEvent event) {
        domainEventPublisher.publish(event);
        webSocketNotificationService.notifyOrderEvent(event);
    }
}
