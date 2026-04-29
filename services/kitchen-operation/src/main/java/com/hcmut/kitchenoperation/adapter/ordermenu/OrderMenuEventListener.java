package com.hcmut.kitchenoperation.adapter.ordermenu;

import com.hcmut.kitchenoperation.adapter.OrderServiceClient;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderCancelledMessage;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderItemUpdatedMessage;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderPlacedMessage;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderSessionMessage;
import com.hcmut.kitchenoperation.service.KitchenService;
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
@ConditionalOnProperty(name = "app.events.kafka-enabled", havingValue = "true")
public class OrderMenuEventListener {
    private static final String TOPIC_ORDER_PLACED = "order.placed";
    private static final String TOPIC_ORDER_ITEM_UPDATED = "order.item.updated";
    private static final String TOPIC_ORDER_CANCELLED = "order.cancelled";
    private static final String TOPIC_ORDER_SESSION_STARTED = "order.session.started";
    private static final String TOPIC_ORDER_SESSION_CLOSED = "order.session.closed";
    private static final String TOPIC_ORDER_SESSION_CANCELLED = "order.session.cancelled";

    private final JsonMapper jsonMapper;
    private final OrderServiceClient orderServiceClient;
    private final KitchenService kitchenService;

    @KafkaListener(
            topics = {
                    TOPIC_ORDER_PLACED,
                    TOPIC_ORDER_ITEM_UPDATED,
                    TOPIC_ORDER_CANCELLED,
                    TOPIC_ORDER_SESSION_STARTED,
                    TOPIC_ORDER_SESSION_CLOSED,
                    TOPIC_ORDER_SESSION_CANCELLED
            },
            groupId = "${app.events.order-menu.group-id:kitchen-operation-order-menu}"
    )
    public void onOrderMenuEvent(@Header(KafkaHeaders.RECEIVED_TOPIC) String topic, String payload) {
        try {
            switch (topic) {
                case TOPIC_ORDER_PLACED -> onOrderPlaced(deserialize(payload, OrderPlacedMessage.class));
                case TOPIC_ORDER_ITEM_UPDATED -> onOrderItemUpdated(deserialize(payload, OrderItemUpdatedMessage.class));
                case TOPIC_ORDER_CANCELLED -> onOrderCancelled(deserialize(payload, OrderCancelledMessage.class));
                case TOPIC_ORDER_SESSION_STARTED, TOPIC_ORDER_SESSION_CLOSED, TOPIC_ORDER_SESSION_CANCELLED ->
                        onOrderSessionChanged(deserialize(payload, OrderSessionMessage.class));
                default -> log.debug("Ignored unsupported order event topic={}", topic);
            }
        } catch (JacksonException ex) {
            log.error("Failed to deserialize order-menu event. topic={} payload={}", topic, payload, ex);
        } catch (RuntimeException ex) {
            log.error("Failed to process order-menu event. topic={} payload={}", topic, payload, ex);
        }
    }

    private void onOrderPlaced(OrderPlacedMessage message) {
        orderServiceClient.applyOrderPlaced(message.aggregateId(), message.data());
        kitchenService.routeOrderToKitchen(resolveOrderId(message));
    }

    private void onOrderItemUpdated(OrderItemUpdatedMessage message) {
        orderServiceClient.applyOrderItemUpdated(message.aggregateId(), message.data());
    }

    private void onOrderCancelled(OrderCancelledMessage message) {
        orderServiceClient.applyOrderCancelled(message.aggregateId(), message.data());
    }

    private void onOrderSessionChanged(OrderSessionMessage message) {
        orderServiceClient.applyOrderSessionUpdated(message.aggregateId(), message.data());
    }

    private <T> T deserialize(String payload, Class<T> type) throws JacksonException {
        return jsonMapper.readValue(payload, type);
    }

    private String resolveOrderId(OrderPlacedMessage message) {
        if (message.data() != null && message.data().orderId() != null && !message.data().orderId().isBlank()) {
            return message.data().orderId();
        }
        return message.aggregateId();
    }
}
