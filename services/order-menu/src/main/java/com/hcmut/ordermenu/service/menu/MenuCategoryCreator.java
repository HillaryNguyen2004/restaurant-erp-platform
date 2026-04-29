package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import com.hcmut.ordermenu.dto.CreateMenuCategoryRequest;
import com.hcmut.ordermenu.validator.MenuCategoryValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class MenuCategoryCreator {
    private final IMenuCategoryRepository menuCategoryRepository;
    private final MenuCategoryValidator menuCategoryValidator;

    public MenuCategory create(CreateMenuCategoryRequest request) {
        if (request.name() == null || request.name().trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        // Determine display order: use provided value, or get next available if not provided
        Integer displayOrder = request.displayOrder() != null ? 
                request.displayOrder() : 
                menuCategoryValidator.getNextAvailableDisplayOrder();

        // Validate display order (range and uniqueness)
        menuCategoryValidator.validateDisplayOrderForCreation(displayOrder);

        MenuCategory category = new MenuCategory(
                request.name(),
                displayOrder,
                true
        );

        return menuCategoryRepository.save(category);
    }
}
