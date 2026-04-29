package com.hcmut.ordermenu.domain.events;

public interface DomainEventPublisher {
    void publish(DomainEvent event);
}