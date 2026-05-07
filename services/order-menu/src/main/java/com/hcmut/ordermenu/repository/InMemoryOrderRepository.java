package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.enums.OrderStatus;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryOrderRepository implements IOrderRepository {
    private final Map<UUID, Order> orderMap = new ConcurrentHashMap<>();

    @Override
    public Order save(Order order) {
        orderMap.put(order.getOrderId(), order);
        return order;
    }

    @Override
    public Order findById(UUID orderId) {
        return orderMap.get(orderId);
    }

    @Override
    public List<Order> findBySession(UUID sessionId) {
        List<Order> matches = new ArrayList<>();
        for (Order order : orderMap.values()) {
            if (sessionId.equals(order.getOrderSessionId())) {
                matches.add(order);
            }
        }
        return matches;
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        List<Order> matches = new ArrayList<>();
        for (Order order : orderMap.values()) {
            if (status == order.getStatus()) {
                matches.add(order);
            }
        }
        return matches;
    }

    @Override
    public void delete(UUID orderId) {
        orderMap.remove(orderId);
    }
}
