package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "false")
public class LoggingDomainEventPublisher implements DomainEventPublisher {
    @Override
    public void publish(DomainEvent event) {
        log.info("event-published-locally type={} aggregateId={} eventId={}",
                event.getEventType(),
                event.getAggregateId(),
                event.getEventId());
    }
}