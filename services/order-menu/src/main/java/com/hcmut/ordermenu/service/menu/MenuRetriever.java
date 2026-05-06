package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuRetriever {
    private final IMenuItemRepository menuItemRepository;
    private final IMenuCategoryRepository menuCategoryRepository;

    public List<MenuItem> getAll() {
        return menuItemRepository.findAll();
    }

    public List<MenuItem> getByCategory(UUID menuCategoryId) {
        MenuCategory category = menuCategoryRepository.findById(menuCategoryId);
        if (category == null) {
            throw new IllegalArgumentException("Menu category not found: " + menuCategoryId);
        }

        return menuItemRepository.findByCategory(menuCategoryId);
    }

    public MenuItem getById(UUID itemId) {
        MenuItem item = menuItemRepository.findById(itemId);
        if (item == null) {
            throw new IllegalArgumentException("Menu item not found: " + itemId);
        }
        return item;
    }
}
