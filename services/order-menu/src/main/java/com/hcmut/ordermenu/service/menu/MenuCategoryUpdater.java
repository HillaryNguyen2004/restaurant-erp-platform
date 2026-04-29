package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import com.hcmut.ordermenu.dto.UpdateMenuCategoryRequest;
import com.hcmut.ordermenu.validator.MenuCategoryValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuCategoryUpdater {
    private final IMenuCategoryRepository menuCategoryRepository;
    private final MenuCategoryValidator menuCategoryValidator;

    public MenuCategory update(UUID categoryId, UpdateMenuCategoryRequest request) {
        MenuCategory category = menuCategoryRepository.findById(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("Menu category not found: " + categoryId);
        }

        if (request.name() == null || request.name().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        Boolean isActive = request.active() != null ? request.active() : category.isActive();
        Integer displayOrder = request.displayOrder() != null ? request.displayOrder() : category.getDisplayOrder();

        // Validate display order only if it's being changed or was previously null
        if (request.displayOrder() != null || category.getDisplayOrder() == null) {
            menuCategoryValidator.validateDisplayOrderForUpdate(displayOrder, categoryId);
        }

        category.update(request.name(), displayOrder, isActive);
        return menuCategoryRepository.save(category);
    }
}
