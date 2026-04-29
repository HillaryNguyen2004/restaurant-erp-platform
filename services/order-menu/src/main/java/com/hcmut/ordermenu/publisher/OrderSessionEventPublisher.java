package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.order.OrderSessionCancelledEvent;
import com.hcmut.ordermenu.domain.events.order.OrderSessionClosedEvent;
import com.hcmut.ordermenu.domain.events.order.OrderSessionStartedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class OrderSessionEventPublisher {
    private final DomainEventPublisher domainEventPublisher;

    public void publishOrderSessionStarted(OrderSession session) {
        domainEventPublisher.publish(new OrderSessionStartedEvent(session));
    }

    public void publishOrderSessionClosed(OrderSession session) {
        domainEventPublisher.publish(new OrderSessionClosedEvent(session));
    }

    public void publishOrderSessionCancelled(OrderSession session) {
        domainEventPublisher.publish(new OrderSessionCancelledEvent(session));
    }
}