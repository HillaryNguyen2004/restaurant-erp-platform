package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.port.INotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class WebSocketNotificationService implements INotificationService {
    @Override
    public void notifyStation(String stationId, Object message) {
        log.info("notify-station stationId={} payload={}", stationId, message);
    }

    @Override
    public void notifyStaff(String userId, Object message) {
        log.info("notify-staff userId={} payload={}", userId, message);
    }

    @Override
    public void broadcastToKitchen(Object message) {
        log.info("broadcast-kitchen payload={}", message);
    }
}
