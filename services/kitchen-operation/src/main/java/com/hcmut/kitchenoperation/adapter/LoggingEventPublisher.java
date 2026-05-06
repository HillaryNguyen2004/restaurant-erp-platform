package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.domain.events.DomainEvent;
import com.hcmut.kitchenoperation.port.IEventPublisher;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.util.List;

@Slf4j
@Component
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "false", matchIfMissing = true)
public class LoggingEventPublisher implements IEventPublisher {
    @Override
    public void publish(DomainEvent event) {
        log.info(
                "kitchen-event type={} aggregateId={} eventId={} payload={}",
                event.getEventType(),
                event.getAggregateId(),
                event.getEventId(),
                event.toPayload()
        );
    }

    @Override
    public void publishBatch(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            publish(event);
        }
    }
}
