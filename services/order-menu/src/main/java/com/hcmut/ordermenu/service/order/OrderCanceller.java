package com.hcmut.ordermenu.service.order;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import com.hcmut.ordermenu.publisher.OrderEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderCanceller {
    private final IOrderSessionRepository orderSessionRepository;
    private final IOrderRepository orderRepository;
    private final OrderEventPublisher orderEventPublisher;

    public void cancel(UUID sessionId, UUID orderId, String reason) {
        OrderSession session = orderSessionRepository.findById(sessionId);
        if (session == null) {
            throw new IllegalArgumentException("Session not found: " + sessionId);
        }

        Order order = orderRepository.findById(orderId);
        if (order == null || !sessionId.equals(order.getOrderSessionId())) {
            throw new IllegalArgumentException("Order not found for session: " + orderId);
        }

        order.cancel(reason);
        Order saved = orderRepository.save(order);
        orderEventPublisher.publishOrderCancelled(saved);
    }
}
