package com.hcmut.ordermenu.service.order;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import com.hcmut.ordermenu.dto.OrderItemRequest;
import com.hcmut.ordermenu.dto.PlaceOrderRequest;
import com.hcmut.ordermenu.publisher.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderPlacer {
    private final IOrderSessionRepository orderSessionRepository;
    private final IOrderRepository orderRepository;
    private final IMenuItemRepository menuItemRepository;
    private final OrderEventPublisher orderEventPublisher;

    public Order placeOrder(UUID sessionId, PlaceOrderRequest request) {
        OrderSession session = orderSessionRepository.findById(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }
        if (session.getStatus() != OrderSessionStatus.ACTIVE) {
            throw new IllegalStateException("Session is not active: " + sessionId);
        }

        List<OrderItem> items = new ArrayList<>();
        for (OrderItemRequest input : request.items()) {
            MenuItem menuItem = menuItemRepository.findById(input.menuItemId());
            if (menuItem == null) {
                throw new IllegalArgumentException("Menu item not found: " + input.menuItemId());
            }
            if (!menuItem.isAvailable()) {
                throw new IllegalStateException("Menu item unavailable: " + input.menuItemId());
            }

            BigDecimal price = menuItem.getPrice();
            items.add(new OrderItem(
                    input.menuItemId(),
                    input.quantity(),
                    price,
                    input.modifiers(),
                    input.specialInstructions(),
                    menuItem.getName(),
                    menuItem.getDishType(),
                    menuItem.getCourseType(),
                    menuItem.getAllergyTags(),
                    menuItem.getPrepTimeMinutes()
            ));
        }

        Order order = new Order(sessionId, items);
        Order saved = orderRepository.save(order);
        orderEventPublisher.publishOrderPlaced(saved);
        return saved;
    }
}
