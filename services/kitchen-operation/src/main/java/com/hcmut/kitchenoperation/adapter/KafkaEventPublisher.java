package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.domain.events.DomainEvent;
import com.hcmut.kitchenoperation.port.IEventPublisher;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "true")
@Slf4j
public class KafkaEventPublisher implements IEventPublisher {
    private final KafkaTemplate<String, String> kafkaTemplate;
    private final JsonMapper jsonMapper;
    private final ExecutorService publisherExecutor = Executors.newSingleThreadExecutor(runnable -> {
        Thread thread = new Thread(runnable, "kitchen-event-publisher");
        thread.setDaemon(true);
        return thread;
    });

    @Value("${app.events.topic-prefix:kitchen}")
    private String topicPrefix;

    @Override
    public void publish(DomainEvent event) {
        String topic = getTopicName(event);
        String payload = serializeEvent(event);
        String aggregateId = event.getAggregateId();

        publisherExecutor.execute(() ->
                kafkaTemplate.send(topic, aggregateId, payload)
                        .whenComplete((result, ex) -> {
                            if (ex != null) {
                                log.warn("kafka-publish-failed topic={} aggregateId={}", topic, aggregateId, ex);
                            }
                        })
        );
    }

    @Override
    public void publishBatch(List<DomainEvent> events) {
        for (DomainEvent event : events) {
            publish(event);
        }
    }

    private String getTopicName(DomainEvent event) {
        if (event.getEventType().startsWith(topicPrefix + ".")) {
            return event.getEventType();
        }
        return topicPrefix + "." + event.getEventType();
    }

    private String serializeEvent(DomainEvent event) {
        Map<String, Object> envelope = new LinkedHashMap<>();
        envelope.put("eventId", event.getEventId().toString());
        envelope.put("eventType", event.getEventType());
        envelope.put("occurredAt", event.getOccurredAt().toString());
        envelope.put("aggregateId", event.getAggregateId());
        envelope.put("data", event.toPayload());

        try {
            return jsonMapper.writeValueAsString(envelope);
        } catch (JacksonException ex) {
            throw new IllegalStateException("Failed to serialize event", ex);
        }
    }

    @PreDestroy
    void shutdown() {
        publisherExecutor.shutdown();
    }
}
