package com.hcmut.ordermenu.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class KafkaService {
    private final KafkaTemplate<String, String> kafkaTemplate;

    public void send(String topic, String key, String payload) {
        try {
            kafkaTemplate.send(topic, key, payload).get();
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Kafka publish interrupted for topic: " + topic, ex);
        } catch (Exception ex) {
            log.error("Kafka publish failed topic={} key={}", topic, key, ex);
            throw new IllegalStateException("Kafka publish failed for topic: " + topic, ex);
        }
    }
}
