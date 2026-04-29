package com.hcmut.ordermenu.domain.entity;

import lombok.Getter;

import java.util.UUID;

@Getter
public class MenuCategory {
    private UUID menuCategoryId;
    private String name;
    private Integer displayOrder;
    private boolean isActive;

    public MenuCategory(String name, Integer displayOrder, Boolean isActive) {
        this.menuCategoryId = UUID.randomUUID();
        this.name = name;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }

    public static MenuCategory restore(UUID menuCategoryId, String name, Integer displayOrder, Boolean isActive) {
        MenuCategory category = new MenuCategory(name, displayOrder, isActive);
        category.menuCategoryId = menuCategoryId;
        return category;
    }

    public void update(String name, Integer displayOrder, Boolean isActive) {
        this.name = name;
        this.displayOrder = displayOrder;
        this.isActive = isActive;
    }

    public void activate() {
        this.isActive = true;
    }

    public void deactivate() {
        this.isActive = false;
    }
}
