package com.hcmut.kitchenoperation.port;

import com.hcmut.kitchenoperation.domain.events.DomainEvent;

import java.util.List;

public interface IEventPublisher {
    void publish(DomainEvent event);

    void publishBatch(List<DomainEvent> events);
}
