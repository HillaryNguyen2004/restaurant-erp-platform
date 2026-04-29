package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.dto.UpdateMenuItemRequest;
import com.hcmut.ordermenu.publisher.MenuEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuItemUpdater {
    private final IMenuItemRepository menuItemRepository;
    private final MenuEventPublisher eventPublisher;

    public MenuItem update(UUID itemId, UpdateMenuItemRequest request) {
        MenuItem item = menuItemRepository.findById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Menu item not found: " + itemId);
        }

        item.update(
                request.name(),
                request.description(),
                request.price(),
                request.available(),
                request.dishType(),
                request.courseType(),
                request.prepTimeMinutes(),
                request.allergyTags()
        );
        MenuItem saved = menuItemRepository.save(item);
        eventPublisher.publishMenuItemUpdated(saved);
        return saved;
    }
}
