package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IAvailabilityCache;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.publisher.MenuEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuAvailabilityManager {
    private final IMenuItemRepository menuItemRepository;
    private final IAvailabilityCache availabilityCache;
    private final MenuEventPublisher eventPublisher;

    public void markUnavailable(UUID itemId, String reason) {
        MenuItem item = menuItemRepository.findById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Menu item not found: " + itemId);
        }

        item.markAsUnavailable();
        menuItemRepository.save(item);
        availabilityCache.markUnavailable(itemId);
        eventPublisher.publishMenuItemUnavailable(itemId, reason);
    }

    public void markAvailable(UUID itemId) {
        MenuItem item = menuItemRepository.findById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Menu item not found: " + itemId);
        }

        item.markAsAvailable();
        menuItemRepository.save(item);
        availabilityCache.markAvailable(itemId);
        eventPublisher.publishMenuItemAvailable(itemId);
    }

    public boolean isAvailable(UUID itemId) {
        MenuItem item = menuItemRepository.findById(itemId);
        if (item == null) {
            return false;
        }

        return item.isAvailable() && availabilityCache.isAvailable(itemId);
    }

    public Map<UUID, Boolean> checkAvailability(List<UUID> itemIds) {
        Map<UUID, Boolean> result = new HashMap<>();
        for (UUID itemId : itemIds) {
            result.put(itemId, isAvailable(itemId));
        }
        return result;
    }
}
