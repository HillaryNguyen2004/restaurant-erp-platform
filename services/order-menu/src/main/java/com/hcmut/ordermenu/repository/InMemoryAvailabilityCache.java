package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.repository.IAvailabilityCache;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryAvailabilityCache implements IAvailabilityCache {
    private final Map<UUID, Boolean> availabilityMap = new ConcurrentHashMap<>();

    @Override
    public void markUnavailable(UUID itemId) {
        availabilityMap.put(itemId, false);
    }

    @Override
    public void markAvailable(UUID itemId) {
        availabilityMap.put(itemId, true);
    }

    @Override
    public boolean isAvailable(UUID itemId) {
        return availabilityMap.getOrDefault(itemId, true);
    }
}
