package com.hcmut.ordermenu.controller;

import com.hcmut.ordermenu.dto.OpenSessionRequest;
import com.hcmut.ordermenu.dto.OrderDto;
import com.hcmut.ordermenu.dto.OrderSessionDto;
import com.hcmut.ordermenu.dto.PlaceOrderRequest;
import com.hcmut.ordermenu.dto.UpdateOrderItemRequest;
import com.hcmut.ordermenu.facade.OrderSessionFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/order-sessions")
@RequiredArgsConstructor
public class OrderSessionController {
    private final OrderSessionFacade facade;

    @PostMapping
    public OrderSessionDto openSession(@RequestBody OpenSessionRequest request) {
        return facade.openSession(request);
    }

    @PutMapping("/{orderSessionId}/close")
    public void closeOrderSession(@PathVariable UUID orderSessionId) {
        facade.closeSession(orderSessionId);
    }

    @GetMapping("/{orderSessionId}")
    public OrderSessionDto getSession(@PathVariable UUID orderSessionId) {
        return facade.getSession(orderSessionId);
    }

    @GetMapping("/table/{tableId}")
    public OrderSessionDto getSessionByTable(@PathVariable UUID tableId) {
        return facade.getSessionByTable(tableId);
    }

    @PostMapping("/{orderSessionId}/orders")
    public OrderDto placeOrder(@PathVariable UUID orderSessionId, @RequestBody PlaceOrderRequest request) {
        return facade.placeOrder(orderSessionId, request);
    }

    @PutMapping("/{orderSessionId}/orders/{orderId}/cancel")
    public void cancelOrder(@PathVariable UUID orderSessionId, @PathVariable UUID orderId, @RequestBody String reason) {
        facade.cancelOrder(orderSessionId, orderId, reason);
    }

    @PutMapping("/{orderSessionId}/orders/{orderId}/items/{itemId}")
    public OrderDto updateOrderItem(
            @PathVariable UUID orderSessionId,
            @PathVariable UUID orderId,
            @PathVariable UUID itemId,
            @RequestBody UpdateOrderItemRequest request
    ) {
        return facade.updateOrderItem(orderSessionId, orderId, itemId, request);
    }
}
