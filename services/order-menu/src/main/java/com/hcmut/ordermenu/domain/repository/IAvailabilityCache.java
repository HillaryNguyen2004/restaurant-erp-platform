package com.hcmut.ordermenu.domain.repository;

import java.util.UUID;

public interface IAvailabilityCache {
    void markUnavailable(UUID itemId);

    void markAvailable(UUID itemId);

    boolean isAvailable(UUID itemId);
}
