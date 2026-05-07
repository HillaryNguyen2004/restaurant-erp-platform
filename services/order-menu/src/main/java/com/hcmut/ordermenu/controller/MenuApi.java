package com.hcmut.ordermenu.controller;

import com.hcmut.ordermenu.dto.MenuDto;
import com.hcmut.ordermenu.dto.MenuItemDto;
import com.hcmut.ordermenu.facade.MenuFacade;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/menu")
@RequiredArgsConstructor
public class MenuApi {
    private final MenuFacade facade;

    @GetMapping
    public MenuDto getMenu() {
        return facade.getMenu();
    }

    @GetMapping("/categories/{menuCategoryId}/items")
    public List<MenuItemDto> getMenuByCategory(@PathVariable UUID menuCategoryId) {
        return facade.getMenuByCategory(menuCategoryId);
    }

    @GetMapping("/items/{itemId}")
    public MenuItemDto getMenuItem(@PathVariable UUID itemId) {
        return facade.getMenuItem(itemId);
    }
}
