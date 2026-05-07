package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import com.hcmut.ordermenu.dto.CreateMenuItemRequest;
import com.hcmut.ordermenu.factory.MenuItemFactory;
import com.hcmut.ordermenu.publisher.MenuEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuItemCreator {
    private final IMenuItemRepository menuItemRepository;
    private final IMenuCategoryRepository menuCategoryRepository;
    private final MenuItemFactory menuItemFactory;
    private final MenuEventPublisher eventPublisher;

    public MenuItem create(CreateMenuItemRequest request) {
        MenuCategory category = menuCategoryRepository.findById(request.menuCategoryId());
        if (category == null) {
            throw new IllegalArgumentException("Menu category not found: " + request.menuCategoryId());
        }

        MenuItem item = menuItemFactory.createMenuItem(request, category);
        MenuItem saved = menuItemRepository.save(item);
        eventPublisher.publishMenuItemCreated(saved);
        return saved;
    }
}
