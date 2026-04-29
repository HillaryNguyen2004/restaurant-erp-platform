package com.hcmut.ordermenu.domain.repository;

import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.enums.OrderStatus;

import java.util.List;
import java.util.UUID;

public interface IOrderRepository {
    Order save(Order order);

    Order findById(UUID orderId);

    List<Order> findBySession(UUID sessionId);

    List<Order> findByStatus(OrderStatus status);

    void delete(UUID orderId);
}
