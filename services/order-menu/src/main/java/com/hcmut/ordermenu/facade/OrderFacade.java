package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.service.order.OrderSessionManager;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@AllArgsConstructor
public class OrderFacade {
    private final OrderSessionManager orderSessionManager;

    public OrderSession startOrderSession(UUID orderSessionId){
        return orderSessionManager.startOrderSession(orderSessionId);
    }

    public void closeOrderSession(UUID orderSessionId){
        orderSessionManager.closeOrderSession(orderSessionId);
    }

    public void cancelOrderSession(UUID orderSessionId){
        orderSessionManager.cancelOrderSession(orderSessionId);
    }
}
