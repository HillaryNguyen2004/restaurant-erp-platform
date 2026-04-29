package com.hcmut.ordermenu.service.order;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import com.hcmut.ordermenu.publisher.OrderSessionEventPublisher;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class OrderSessionManager {
    private final IOrderSessionRepository orderSessionRepository;
    private final OrderSessionEventPublisher orderSessionEventPublisher;

    public OrderSession startOrderSession(UUID tableId) {
        OrderSession orderSession = OrderSession.create(tableId);
        OrderSession saved = orderSessionRepository.save(orderSession);
        orderSessionEventPublisher.publishOrderSessionStarted(saved);
        return saved;
    }

    public void closeOrderSession(UUID orderSessionId) {
        OrderSession orderSession = orderSessionRepository.findById(orderSessionId);
        if (orderSession != null) {
            orderSession.close();
            OrderSession saved = orderSessionRepository.save(orderSession);
            orderSessionEventPublisher.publishOrderSessionClosed(saved);
        }
    }

    public void cancelOrderSession(UUID orderSessionId) {
        OrderSession orderSession = orderSessionRepository.findById(orderSessionId);
        if (orderSession != null) {
            orderSession.cancel();
            OrderSession saved = orderSessionRepository.save(orderSession);
            orderSessionEventPublisher.publishOrderSessionCancelled(saved);
        }
    }
}
