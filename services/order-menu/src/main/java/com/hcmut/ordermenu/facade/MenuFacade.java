package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import com.hcmut.ordermenu.dto.CreateMenuCategoryRequest;
import com.hcmut.ordermenu.dto.CreateMenuItemRequest;
import com.hcmut.ordermenu.dto.MenuCategoryDto;
import com.hcmut.ordermenu.dto.MenuDto;
import com.hcmut.ordermenu.dto.MenuItemDto;
import com.hcmut.ordermenu.dto.UpdateMenuCategoryRequest;
import com.hcmut.ordermenu.dto.UpdateMenuItemRequest;
import com.hcmut.ordermenu.service.menu.MenuAvailabilityManager;
import com.hcmut.ordermenu.service.menu.MenuCategoryCreator;
import com.hcmut.ordermenu.service.menu.MenuCategoryDeleter;
import com.hcmut.ordermenu.service.menu.MenuCategoryUpdater;
import com.hcmut.ordermenu.service.menu.MenuItemCreator;
import com.hcmut.ordermenu.service.menu.MenuItemDeleter;
import com.hcmut.ordermenu.service.menu.MenuItemUpdater;
import com.hcmut.ordermenu.service.menu.MenuRetriever;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuFacade {
    private final MenuRetriever menuRetriever;
    private final MenuItemCreator menuItemCreator;
    private final MenuItemUpdater menuItemUpdater;
    private final MenuItemDeleter menuItemDeleter;
    private final MenuAvailabilityManager menuAvailabilityManager;
    private final IMenuCategoryRepository menuCategoryRepository;
    private final MenuCategoryCreator menuCategoryCreator;
    private final MenuCategoryUpdater menuCategoryUpdater;
    private final MenuCategoryDeleter menuCategoryDeleter;

    public MenuDto getMenu() {
        List<MenuCategoryDto> categories = menuCategoryRepository.findAll().stream().map(this::toCategoryDto).toList();
        List<MenuItemDto> items = menuRetriever.getAll().stream().map(this::toItemDto).toList();
        return new MenuDto(categories, items);
    }

    public List<MenuItemDto> getMenuByCategory(UUID menuCategoryId) {
        return menuRetriever.getByCategory(menuCategoryId).stream().map(this::toItemDto).toList();
    }

    public MenuItemDto getMenuItem(UUID itemId) {
        return toItemDto(menuRetriever.getById(itemId));
    }

    public MenuItemDto createMenuItem(CreateMenuItemRequest request) {
        return toItemDto(menuItemCreator.create(request));
    }

    public MenuItemDto updateMenuItem(UUID itemId, UpdateMenuItemRequest request) {
        return toItemDto(menuItemUpdater.update(itemId, request));
    }

    public void deleteMenuItem(UUID itemId) {
        menuItemDeleter.delete(itemId);
    }

    public void markItemUnavailable(UUID itemId, String reason) {
        menuAvailabilityManager.markUnavailable(itemId, reason);
    }

    public void markItemAvailable(UUID itemId) {
        menuAvailabilityManager.markAvailable(itemId);
    }

    public MenuCategoryDto createCategory(CreateMenuCategoryRequest request) {
        return toCategoryDto(menuCategoryCreator.create(request));
    }

    public MenuCategoryDto updateCategory(UUID categoryId, UpdateMenuCategoryRequest request) {
        return toCategoryDto(menuCategoryUpdater.update(categoryId, request));
    }

    public void deleteCategory(UUID categoryId) {
        menuCategoryDeleter.delete(categoryId);
    }

    private MenuItemDto toItemDto(MenuItem item) {
        return new MenuItemDto(
                item.getMenuItemId(),
                item.getMenuCategoryId(),
                item.getName(),
                item.getDescription(),
                item.getPrice(),
                item.isAvailable(),
                item.getDishType(),
                item.getCourseType(),
                item.getPrepTimeMinutes(),
                item.getAllergyTags()
        );
    }

    private MenuCategoryDto toCategoryDto(MenuCategory category) {
        return new MenuCategoryDto(
                category.getMenuCategoryId(),
                category.getName(),
                category.getDisplayOrder(),
                category.isActive()
        );
    }
}
