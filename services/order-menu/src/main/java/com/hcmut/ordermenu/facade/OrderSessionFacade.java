package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
import com.hcmut.ordermenu.dto.OpenSessionRequest;
import com.hcmut.ordermenu.dto.OrderDto;
import com.hcmut.ordermenu.dto.OrderSessionDto;
import com.hcmut.ordermenu.dto.PlaceOrderRequest;
import com.hcmut.ordermenu.dto.OrderItemDto;
import com.hcmut.ordermenu.dto.UpdateOrderItemRequest;
import com.hcmut.ordermenu.service.order.OrderCanceller;
import com.hcmut.ordermenu.service.order.OrderPlacer;
import com.hcmut.ordermenu.service.order.OrderUpdater;
import com.hcmut.ordermenu.service.order.OrderSessionManager;
import com.hcmut.ordermenu.service.order.OrderSessionRetriever;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderSessionFacade {
    private final OrderSessionManager orderSessionManager;
    private final OrderSessionRetriever orderSessionRetriever;
    private final OrderPlacer orderPlacer;
    private final OrderCanceller orderCanceller;
    private final OrderUpdater orderUpdater;
    private final IOrderRepository orderRepository;

    public OrderSessionDto openSession(OpenSessionRequest request) {
        OrderSession session = orderSessionManager.startOrderSession(request.tableId());
        return toSessionDto(session);
    }

    public void closeSession(UUID sessionId) {
        orderSessionManager.closeOrderSession(sessionId);
    }

    public OrderSessionDto getSession(UUID sessionId) {
        OrderSession session = orderSessionRetriever.getById(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        return toSessionDto(session);
    }

    public OrderSessionDto getSessionByTable(UUID tableId) {
        OrderSession session = orderSessionRetriever.getActiveByTable(tableId);
        if (session == null) {
            throw new IllegalArgumentException("Active session not found for table: " + tableId);
        }
        return toSessionDto(session);
    }

    public OrderDto placeOrder(UUID sessionId, PlaceOrderRequest request) {
        Order order = orderPlacer.placeOrder(sessionId, request);
        return toOrderDto(order);
    }

    public void cancelOrder(UUID sessionId, UUID orderId, String reason) {
        orderCanceller.cancel(sessionId, orderId, reason);
    }

    public OrderDto updateOrderItem(UUID sessionId, UUID orderId, UUID itemId, UpdateOrderItemRequest request) {
        Order updated = orderUpdater.updateItem(sessionId, orderId, itemId, request);
        return toOrderDto(updated);
    }

    private OrderSessionDto toSessionDto(OrderSession session) {
        List<OrderDto> orders = orderRepository.findBySession(session.getOrderSessionId())
                .stream()
                .map(this::toOrderDto)
                .toList();

        BigDecimal subtotal = orders.stream()
                .map(OrderDto::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new OrderSessionDto(
                session.getOrderSessionId(),
                session.getTableId(),
                session.getStatus(),
                session.getTimeRange().getStartTime(),
                session.getTimeRange().getEndTime(),
                orders,
                subtotal
        );
    }

    private OrderDto toOrderDto(Order order) {
        List<OrderItemDto> items = order.getOrderItems()
                .stream()
                .map(this::toOrderItemDto)
                .toList();

        return new OrderDto(
                order.getOrderId(),
                order.getOrderSessionId(),
                order.getStatus(),
                order.getOrderTime(),
                items,
                order.calculateSubtotal()
        );
    }

    private OrderItemDto toOrderItemDto(OrderItem item) {
        return new OrderItemDto(
                item.getOrderItemId(),
                item.getMenuItemId(),
                item.getQuantity(),
                item.getPrice(),
                item.subtotal(),
                item.getModifiers(),
                item.getSpecialInstructions()
        );
    }
}
