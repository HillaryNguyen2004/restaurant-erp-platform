package com.hcmut.ordermenu.controller;

import com.hcmut.ordermenu.dto.CreateMenuItemRequest;
import com.hcmut.ordermenu.dto.CreateMenuCategoryRequest;
import com.hcmut.ordermenu.dto.MenuItemDto;
import com.hcmut.ordermenu.dto.MenuCategoryDto;
import com.hcmut.ordermenu.dto.UpdateMenuItemRequest;
import com.hcmut.ordermenu.dto.UpdateMenuCategoryRequest;
import com.hcmut.ordermenu.facade.MenuFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/menu-management")
@RequiredArgsConstructor
public class MenuManagementApi {
    private final MenuFacade facade;

    @PostMapping("/items")
    public MenuItemDto createMenuItem(@RequestBody CreateMenuItemRequest request) {
        return facade.createMenuItem(request);
    }

    @PutMapping("/items/{itemId}")
    public MenuItemDto updateMenuItem(@PathVariable UUID itemId, @RequestBody UpdateMenuItemRequest request) {
        return facade.updateMenuItem(itemId, request);
    }

    @DeleteMapping("/items/{itemId}")
    public void deleteMenuItem(@PathVariable UUID itemId) {
        facade.deleteMenuItem(itemId);
    }

    @PutMapping("/items/{itemId}/unavailable")
    public void markItemUnavailable(@PathVariable UUID itemId, @RequestBody String reason) {
        facade.markItemUnavailable(itemId, reason);
    }

    @PutMapping("/items/{itemId}/available")
    public void markItemAvailable(@PathVariable UUID itemId) {
        facade.markItemAvailable(itemId);
    }

    @PostMapping("/categories")
    public MenuCategoryDto createCategory(@RequestBody CreateMenuCategoryRequest request) {
        return facade.createCategory(request);
    }

    @PutMapping("/categories/{categoryId}")
    public MenuCategoryDto updateCategory(@PathVariable UUID categoryId, @RequestBody UpdateMenuCategoryRequest request) {
        return facade.updateCategory(categoryId, request);
    }

    @DeleteMapping("/categories/{categoryId}")
    public void deleteCategory(@PathVariable UUID categoryId) {
        facade.deleteCategory(categoryId);
    }
}
