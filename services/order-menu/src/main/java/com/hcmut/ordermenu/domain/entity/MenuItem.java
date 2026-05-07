package com.hcmut.ordermenu.domain.entity;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Getter
public class MenuItem {
    private static final String DEFAULT_DISH_TYPE = "default";
    private static final String DEFAULT_COURSE_TYPE = "MAIN";
    private static final int DEFAULT_PREP_TIME_MINUTES = 10;

    private UUID menuItemId;
    private UUID menuCategoryId;
    private String name;
    private String description;
    private BigDecimal price;
    private boolean isAvailable;
    private String dishType;
    private String courseType;
    private Integer prepTimeMinutes;
    private List<String> allergyTags;

    public MenuItem(String name, String description, BigDecimal price, Boolean isAvailable) {
        this(null, name, description, price, isAvailable);
    }

    public MenuItem(UUID menuCategoryId, String name, String description, BigDecimal price, Boolean isAvailable) {
        this(menuCategoryId, name, description, price, isAvailable, null, null, null, List.of());
    }

    public MenuItem(
            UUID menuCategoryId,
            String name,
            String description,
            BigDecimal price,
            Boolean isAvailable,
            String dishType,
            String courseType,
            Integer prepTimeMinutes,
            List<String> allergyTags
    ) {
        this.menuItemId = UUID.randomUUID();
        this.menuCategoryId = menuCategoryId;
        this.name = name;
        this.description = description;
        this.price = price;
        this.isAvailable = Boolean.TRUE.equals(isAvailable);
        this.dishType = defaultIfBlank(dishType, DEFAULT_DISH_TYPE);
        this.courseType = defaultIfBlank(courseType, DEFAULT_COURSE_TYPE).toUpperCase(Locale.ROOT);
        this.prepTimeMinutes = prepTimeMinutes == null ? DEFAULT_PREP_TIME_MINUTES : Math.max(1, prepTimeMinutes);
        this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
    }

    public static MenuItem restore(
            UUID menuItemId,
            UUID menuCategoryId,
            String name,
            String description,
            BigDecimal price,
            Boolean isAvailable,
            String dishType,
            String courseType,
            Integer prepTimeMinutes,
            List<String> allergyTags
    ) {
        MenuItem item = new MenuItem(menuCategoryId, name, description, price, isAvailable, dishType, courseType, prepTimeMinutes, allergyTags);
        item.menuItemId = menuItemId;
        return item;
    }

    public void update(
            String name,
            String description,
            BigDecimal price,
            Boolean isAvailable,
            String dishType,
            String courseType,
            Integer prepTimeMinutes,
            List<String> allergyTags
    ) {
        this.name = name;
        this.description = description;
        this.price = price;
        this.isAvailable = Boolean.TRUE.equals(isAvailable);
        this.dishType = defaultIfBlank(dishType, this.dishType);
        this.courseType = defaultIfBlank(courseType, this.courseType).toUpperCase(Locale.ROOT);
        this.prepTimeMinutes = prepTimeMinutes == null ? this.prepTimeMinutes : Math.max(1, prepTimeMinutes);
        this.allergyTags = new ArrayList<>(allergyTags == null ? this.allergyTags : allergyTags);
    }

    public void markAsAvailable() {
        this.isAvailable = true;
    }

    public void markAsUnavailable() {
        this.isAvailable = false;
    }

    public void updateCategory(UUID menuCategoryId) {
        this.menuCategoryId = menuCategoryId;
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
