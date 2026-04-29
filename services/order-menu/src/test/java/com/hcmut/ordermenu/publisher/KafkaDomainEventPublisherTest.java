package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.service.KafkaService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("KafkaDomainEventPublisher Tests")
class KafkaDomainEventPublisherTest {

    @Mock
    private KafkaService kafkaService;

    @Test
    @DisplayName("Should publish envelope with metadata and payload")
    void publish() {
        JsonMapper jsonMapper = JsonMapper.builder().build();
        KafkaDomainEventPublisher publisher = new KafkaDomainEventPublisher(kafkaService, jsonMapper);
        UUID aggregateId = UUID.randomUUID();
        DomainEvent event = new TestDomainEvent(aggregateId, "hello");

        publisher.publish(event);

        ArgumentCaptor<String> payloadCaptor = ArgumentCaptor.forClass(String.class);
        verify(kafkaService).send(eq("test.event"), eq(aggregateId.toString()), payloadCaptor.capture());

        String payload = payloadCaptor.getValue();
        assertTrue(payload.contains("\"eventType\":\"test.event\""));
        assertTrue(payload.contains("\"aggregateId\":\"" + aggregateId + "\""));
        assertTrue(payload.contains("\"message\":\"hello\""));
    }

    private static final class TestDomainEvent extends DomainEvent {
        private final String message;

        private TestDomainEvent(UUID aggregateId, String message) {
            super(aggregateId);
            this.message = message;
        }

        @Override
        public String getEventType() {
            return "test.event";
        }

        @Override
        public Map<String, Object> toPayload() {
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("message", message);
            return payload;
        }
    }
}