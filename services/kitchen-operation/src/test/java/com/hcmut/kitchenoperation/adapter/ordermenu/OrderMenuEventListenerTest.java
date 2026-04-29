package com.hcmut.kitchenoperation.adapter.ordermenu;

import com.hcmut.kitchenoperation.adapter.OrderServiceClient;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderCancelledPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderItemPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderItemUpdatedPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderPlacedPayload;
import com.hcmut.kitchenoperation.adapter.ordermenu.OrderMenuMessages.OrderSessionPayload;
import com.hcmut.kitchenoperation.service.KitchenService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import tools.jackson.databind.json.JsonMapper;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;

@ExtendWith(MockitoExtension.class)
@DisplayName("OrderMenuEventListener Tests")
class OrderMenuEventListenerTest {

    @Mock
    private OrderServiceClient orderServiceClient;

    @Mock
    private KitchenService kitchenService;

    private OrderMenuEventListener listener;

    @BeforeEach
    void setUp() {
        listener = new OrderMenuEventListener(JsonMapper.builder().build(), orderServiceClient, kitchenService);
    }

    @Test
    @DisplayName("Should deserialize order placed payload and apply projection update")
    void shouldApplyOrderPlacedPayload() {
        String payload = """
                {
                  "eventId": "evt-1",
                  "eventType": "order.placed",
                  "occurredAt": "2026-04-28T10:15:30Z",
                  "aggregateId": "order-123",
                  "data": {
                    "orderId": "order-123",
                    "orderSessionId": "session-456",
                    "orderTime": "2026-04-28T10:15:30Z",
                    "status": "PLACED",
                    "subtotal": 34.5,
                    "items": [
                      {
                        "orderItemId": "item-1",
                        "menuItemId": "menu-1",
                        "quantity": 2,
                        "price": 17.25,
                        "subtotal": 34.5,
                        "modifiers": ["less sugar"],
                        "specialInstructions": "warm",
                        "menuItemName": "Chocolate Cake",
                        "dishType": "dessert",
                        "courseType": "DESSERT",
                        "allergyTags": ["dairy"],
                        "prepTimeMinutes": 6
                      }
                    ]
                  }
                }
                """;

        listener.onOrderMenuEvent("order.placed", payload);

        ArgumentCaptor<OrderPlacedPayload> payloadCaptor = ArgumentCaptor.forClass(OrderPlacedPayload.class);
        verify(orderServiceClient).applyOrderPlaced(org.mockito.ArgumentMatchers.eq("order-123"), payloadCaptor.capture());
        verify(kitchenService).routeOrderToKitchen("order-123");

        OrderPlacedPayload captured = payloadCaptor.getValue();
        assertEquals("session-456", captured.orderSessionId());
        assertEquals("PLACED", captured.status());
        assertNotNull(captured.items());
        assertEquals(1, captured.items().size());

        OrderItemPayload item = captured.items().getFirst();
        assertEquals("menu-1", item.menuItemId());
        assertEquals("dessert", item.dishType());
        assertEquals("DESSERT", item.courseType());
        assertEquals(6, item.prepTimeMinutes());
    }

    @Test
    @DisplayName("Should deserialize order item updated payload")
    void shouldApplyOrderItemUpdatedPayload() {
        String payload = """
                {
                  "eventId": "evt-2",
                  "eventType": "order.item.updated",
                  "occurredAt": "2026-04-28T10:20:00Z",
                  "aggregateId": "order-123",
                  "data": {
                    "orderId": "order-123",
                    "orderSessionId": "session-456",
                    "orderItemId": "item-1",
                    "quantity": 3,
                    "specialInstructions": "extra hot"
                  }
                }
                """;

        listener.onOrderMenuEvent("order.item.updated", payload);

        ArgumentCaptor<OrderItemUpdatedPayload> payloadCaptor = ArgumentCaptor.forClass(OrderItemUpdatedPayload.class);
        verify(orderServiceClient).applyOrderItemUpdated(org.mockito.ArgumentMatchers.eq("order-123"), payloadCaptor.capture());

        OrderItemUpdatedPayload captured = payloadCaptor.getValue();
        assertEquals("item-1", captured.orderItemId());
        assertEquals(3, captured.quantity());
        assertEquals("extra hot", captured.specialInstructions());
    }

    @Test
    @DisplayName("Should deserialize order session payload")
    void shouldApplyOrderSessionPayload() {
        String payload = """
                {
                  "eventId": "evt-3",
                  "eventType": "order.session.started",
                  "occurredAt": "2026-04-28T10:00:00Z",
                  "aggregateId": "session-456",
                  "data": {
                    "orderSessionId": "session-456",
                    "tableId": "table-9",
                    "status": "ACTIVE",
                    "startTime": "2026-04-28T10:00:00Z"
                  }
                }
                """;

        listener.onOrderMenuEvent("order.session.started", payload);

        ArgumentCaptor<OrderSessionPayload> payloadCaptor = ArgumentCaptor.forClass(OrderSessionPayload.class);
        verify(orderServiceClient).applyOrderSessionUpdated(org.mockito.ArgumentMatchers.eq("session-456"), payloadCaptor.capture());

        OrderSessionPayload captured = payloadCaptor.getValue();
        assertEquals("table-9", captured.tableId());
        assertEquals("ACTIVE", captured.status());
    }

    @Test
    @DisplayName("Should deserialize order cancelled payload")
    void shouldApplyOrderCancelledPayload() {
        String payload = """
                {
                  "eventId": "evt-4",
                  "eventType": "order.cancelled",
                  "occurredAt": "2026-04-28T10:25:00Z",
                  "aggregateId": "order-123",
                  "data": {
                    "orderId": "order-123",
                    "orderSessionId": "session-456",
                    "status": "CANCELLED",
                    "cancellationReason": "guest request"
                  }
                }
                """;

        listener.onOrderMenuEvent("order.cancelled", payload);

        ArgumentCaptor<OrderCancelledPayload> payloadCaptor = ArgumentCaptor.forClass(OrderCancelledPayload.class);
        verify(orderServiceClient).applyOrderCancelled(org.mockito.ArgumentMatchers.eq("order-123"), payloadCaptor.capture());

        assertEquals("guest request", payloadCaptor.getValue().cancellationReason());
    }

    @Test
    @DisplayName("Should ignore malformed payload")
    void shouldIgnoreMalformedPayload() {
        listener.onOrderMenuEvent("order.placed", "{invalid-json");

        verifyNoInteractions(orderServiceClient);
    }
}
