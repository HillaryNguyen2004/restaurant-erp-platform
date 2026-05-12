package com.hcmut.ordermenu.adapter.kitchen;

import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketCreatedMessage;
import com.hcmut.ordermenu.adapter.kitchen.KitchenOperationMessages.TicketStatusChangedMessage;
import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.enums.OrderStatus;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
import com.hcmut.ordermenu.publisher.OrderEventPublisher;
import com.hcmut.ordermenu.service.order.KitchenTicketStatusTracker;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.KafkaHeaders;
import org.springframework.messaging.handler.annotation.Header;
import org.springframework.stereotype.Component;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

@Component
@Slf4j
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "true", matchIfMissing = true)
public class KitchenOperationEventListener {
    private static final String TOPIC_TICKET_CREATED = "kitchen.ticket.created";
    private static final String TOPIC_TICKET_STATUS_CHANGED = "kitchen.ticket.status.changed";

    private final JsonMapper jsonMapper;
    private final IOrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;
    private final KitchenTicketStatusTracker ticketStatusTracker;

    @KafkaListener(
            topics = {TOPIC_TICKET_CREATED, TOPIC_TICKET_STATUS_CHANGED},
            groupId = "${app.events.kitchen.group-id:order-menu-kitchen-operation}"
    )
    public void onKitchenEvent(@Header(KafkaHeaders.RECEIVED_TOPIC) String topic, String payload) {
        try {
            switch (topic) {
                case TOPIC_TICKET_CREATED -> onTicketCreated(deserialize(payload, TicketCreatedMessage.class));
                case TOPIC_TICKET_STATUS_CHANGED -> onTicketStatusChanged(deserialize(payload, TicketStatusChangedMessage.class));
                default -> log.debug("Ignored unsupported kitchen event topic={}", topic);
            }
        } catch (JacksonException ex) {
            log.error("Failed to deserialize kitchen event. topic={} payload={}", topic, payload, ex);
        } catch (RuntimeException ex) {
            log.error("Failed to process kitchen event. topic={} payload={}", topic, payload, ex);
        }
    }

    private void onTicketCreated(TicketCreatedMessage message) {
        if (message == null || message.data() == null) {
            return;
        }
        ticketStatusTracker.registerTicket(message.data().orderId(), message.data().ticketId() == null ? message.aggregateId() : message.data().ticketId());
    }

    private void onTicketStatusChanged(TicketStatusChangedMessage message) {
        if (message == null || message.data() == null) {
            return;
        }

        String orderId = message.data().orderId();
        String ticketId = message.data().ticketId() == null || message.data().ticketId().isBlank()
                ? message.aggregateId()
                : message.data().ticketId();
        String newStatus = message.data().newStatus();

        OrderStatus targetStatus = ticketStatusTracker.updateTicketStatus(orderId, ticketId, newStatus);
        if (targetStatus == null) {
            return;
        }

        Order order = findOrder(orderId);
        if (order == null || order.getStatus() == OrderStatus.CANCELLED || order.getStatus() == targetStatus) {
            return;
        }

        String oldStatus = order.getStatus().name();
        applyStatus(order, targetStatus);
        Order saved = orderRepository.save(order);
        orderEventPublisher.publishOrderStatusChanged(saved, oldStatus, ticketId);
    }

    private void applyStatus(Order order, OrderStatus targetStatus) {
        switch (targetStatus) {
            case PREPARING -> order.markPreparing();
            case READY -> order.markReady();
            case SERVED -> order.markServed();
            case CANCELLED -> order.cancel("kitchen ticket cancelled");
            default -> {
            }
        }
    }

    private Order findOrder(String orderId) {
        try {
            return orderRepository.findById(java.util.UUID.fromString(orderId));
        } catch (RuntimeException ex) {
            return null;
        }
    }

    private <T> T deserialize(String payload, Class<T> type) throws JacksonException {
        return jsonMapper.readValue(payload, type);
    }
}
