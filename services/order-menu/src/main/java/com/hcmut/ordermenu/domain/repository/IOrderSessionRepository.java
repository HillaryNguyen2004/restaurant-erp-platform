package com.hcmut.ordermenu.domain.repository;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;

import java.util.List;
import java.util.UUID;

public interface IOrderSessionRepository {
    OrderSession save(OrderSession orderSession);

    OrderSession findById(UUID orderSessionId);

    List<OrderSession> findByTable(UUID tableId);

    OrderSession findActiveByTable(UUID tableId);

    List<OrderSession> findByStatus(OrderSessionStatus status);

    void delete(UUID orderSessionId);
}
