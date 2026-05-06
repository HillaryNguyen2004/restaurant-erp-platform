package com.hcmut.ordermenu.service.order;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderSessionRetriever {
    private final IOrderSessionRepository orderSessionRepository;

    public OrderSession getById(UUID sessionId) {
        return orderSessionRepository.findById(sessionId);
    }

    public OrderSession getActiveByTable(UUID tableId) {
        return orderSessionRepository.findActiveByTable(tableId);
    }
}
