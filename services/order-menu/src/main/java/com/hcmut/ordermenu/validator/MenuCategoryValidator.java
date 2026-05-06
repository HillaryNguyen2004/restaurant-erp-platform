package com.hcmut.ordermenu.validator;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.UUID;

/**
 * Validator for MenuCategory display order constraints.
 * Ensures:
 * - Display orders are unique across all categories
 * - Display orders are non-negative integers
 * - Display orders are within acceptable range
 */
@Component
@RequiredArgsConstructor
public class MenuCategoryValidator {
    private final IMenuCategoryRepository menuCategoryRepository;

    private static final int MIN_DISPLAY_ORDER = 0;
    private static final int MAX_DISPLAY_ORDER = 9999;

    /**
     * Validates display order for a new category.
     * Throws exception if order is invalid or already exists.
     */
    public void validateDisplayOrderForCreation(Integer displayOrder) {
        validateDisplayOrderRange(displayOrder);
        validateDisplayOrderUniqueness(displayOrder, null);
    }

    /**
     * Validates display order for updating a category.
     * Throws exception if order is invalid or already exists (excluding the category being updated).
     */
    public void validateDisplayOrderForUpdate(Integer displayOrder, UUID excludeCategoryId) {
        validateDisplayOrderRange(displayOrder);
        validateDisplayOrderUniqueness(displayOrder, excludeCategoryId);
    }

    /**
     * Validates that display order is within acceptable range and non-negative.
     */
    private void validateDisplayOrderRange(Integer displayOrder) {
        if (displayOrder == null) {
            throw new IllegalArgumentException("Display order cannot be null");
        }

        if (displayOrder < MIN_DISPLAY_ORDER) {
            throw new IllegalArgumentException(
                    String.format("Display order must be >= %d, got %d", MIN_DISPLAY_ORDER, displayOrder)
            );
        }

        if (displayOrder > MAX_DISPLAY_ORDER) {
            throw new IllegalArgumentException(
                    String.format("Display order must be <= %d, got %d", MAX_DISPLAY_ORDER, displayOrder)
            );
        }
    }

    /**
     * Ensures display order is unique across all categories.
     * If excludeCategoryId is provided, ignores that category in the check.
     */
    private void validateDisplayOrderUniqueness(Integer displayOrder, UUID excludeCategoryId) {
        List<MenuCategory> allCategories = menuCategoryRepository.findAll();

        boolean isDuplicate = allCategories.stream()
                .filter(category -> excludeCategoryId == null || !category.getMenuCategoryId().equals(excludeCategoryId))
                .anyMatch(category -> category.getDisplayOrder() != null && 
                                     category.getDisplayOrder().equals(displayOrder));

        if (isDuplicate) {
            throw new IllegalArgumentException(
                    String.format("Display order %d is already in use by another category", displayOrder)
            );
        }
    }

    /**
     * Returns the next available display order.
     * Useful for auto-incrementing if client doesn't provide an order.
     */
    public Integer getNextAvailableDisplayOrder() {
        List<MenuCategory> allCategories = menuCategoryRepository.findAll();
        
        if (allCategories.isEmpty()) {
            return MIN_DISPLAY_ORDER;
        }

        return allCategories.stream()
                .map(MenuCategory::getDisplayOrder)
                .mapToInt(order -> order != null ? order : MIN_DISPLAY_ORDER)
                .max()
                .orElse(MIN_DISPLAY_ORDER) + 1;
    }
}
