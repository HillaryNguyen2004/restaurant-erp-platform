package com.hcmut.kitchenoperation.port;

public interface INotificationService {
    void notifyStation(String stationId, Object message);

    void notifyStaff(String userId, Object message);

    void broadcastToKitchen(Object message);
}
