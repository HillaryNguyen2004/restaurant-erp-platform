package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.service.KafkaService;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.Map;

@Component
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "true", matchIfMissing = true)
@RequiredArgsConstructor
public class KafkaDomainEventPublisher implements DomainEventPublisher {
    private final KafkaService kafkaService;
    private final JsonMapper jsonMapper;

    @Override
    public void publish(DomainEvent event) {
        String message = toJson(buildEnvelope(event));
        kafkaService.send(event.getEventType(), event.getAggregateId().toString(), message);
    }

    private Map<String, Object> buildEnvelope(DomainEvent event) {
        Map<String, Object> envelope = new LinkedHashMap<>();
        envelope.put("eventId", event.getEventId().toString());
        envelope.put("eventType", event.getEventType());
        envelope.put("occurredAt", event.getOccurredAt().toString());
        envelope.put("aggregateId", event.getAggregateId().toString());
        envelope.put("data", event.toPayload());
        return envelope;
    }

    private String toJson(Map<String, Object> envelope) {
        try {
            return jsonMapper.writeValueAsString(envelope);
        } catch (JacksonException ex) {
            throw new IllegalStateException("Failed to serialize event envelope", ex);
        }
    }
}