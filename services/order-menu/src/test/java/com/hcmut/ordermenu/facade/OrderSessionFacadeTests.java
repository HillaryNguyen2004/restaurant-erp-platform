package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.enums.OrderStatus;
import com.hcmut.ordermenu.dto.OpenSessionRequest;
import com.hcmut.ordermenu.dto.PlaceOrderRequest;
import com.hcmut.ordermenu.dto.OrderItemRequest;
import com.hcmut.ordermenu.dto.UpdateOrderItemRequest;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
class OrderSessionFacadeTests {

    @Autowired
    private OrderSessionFacade facade;

    @Autowired
    private IMenuItemRepository menuItemRepository;

    @Test
    void openPlaceUpdateAndCancelRound() {
        MenuItem menuItem = new MenuItem("Pho", "Beef noodle soup", BigDecimal.valueOf(3.5), true);
        menuItemRepository.save(menuItem);

        var session = facade.openSession(new OpenSessionRequest(java.util.UUID.randomUUID()));
        assertNotNull(session.sessionId());

        var placedOrder = facade.placeOrder(
                session.sessionId(),
                new PlaceOrderRequest(List.of(
                        new OrderItemRequest(menuItem.getMenuItemId(), 2, List.of("no onion"), "hot")
                ))
        );

        assertEquals(OrderStatus.PLACED, placedOrder.status());
        assertEquals(1, placedOrder.items().size());

        var itemId = placedOrder.items().get(0).itemId();
        var updatedOrder = facade.updateOrderItem(
                session.sessionId(),
                placedOrder.orderId(),
                itemId,
                new UpdateOrderItemRequest(3, List.of("less salt"), "warm")
        );

        assertEquals(3, updatedOrder.items().get(0).quantity());

        facade.cancelOrder(session.sessionId(), placedOrder.orderId(), "guest request");

        var refreshed = facade.getSession(session.sessionId());
        assertEquals(OrderStatus.CANCELLED, refreshed.orders().get(0).status());
    }
}
