package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryOrderSessionRepository implements IOrderSessionRepository {
    private final Map<UUID, OrderSession> orderSessionMap = new ConcurrentHashMap<>();

    @Override
    public OrderSession save(OrderSession orderSession) {
        orderSessionMap.put(orderSession.getOrderSessionId(), orderSession);
        return orderSession;
    }

    @Override
    public OrderSession findById(UUID orderSessionId) {
        return orderSessionMap.get(orderSessionId);
    }

    @Override
    public List<OrderSession> findByTable(UUID tableId) {
        List<OrderSession> matches = new ArrayList<>();
        for (OrderSession session : orderSessionMap.values()) {
            if (tableId.equals(session.getTableId())) {
                matches.add(session);
            }
        }
        return matches;
    }

    @Override
    public OrderSession findActiveByTable(UUID tableId) {
        for (OrderSession session : orderSessionMap.values()) {
            if (tableId.equals(session.getTableId()) && session.getStatus() == OrderSessionStatus.ACTIVE) {
                return session;
            }
        }
        return null;
    }

    @Override
    public List<OrderSession> findByStatus(OrderSessionStatus status) {
        List<OrderSession> matches = new ArrayList<>();
        for (OrderSession session : orderSessionMap.values()) {
            if (status == session.getStatus()) {
                matches.add(session);
            }
        }
        return matches;
    }

    @Override
    public void delete(UUID orderSessionId) {
        orderSessionMap.remove(orderSessionId);
    }
}
