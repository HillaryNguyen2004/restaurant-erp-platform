package com.hcmut.ordermenu.domain.events.menu;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class MenuItemCreatedEvent extends DomainEvent {
    private final UUID menuCategoryId;
    private final String name;
    private final String description;
    private final BigDecimal price;
    private final boolean available;
    private final String dishType;
    private final String courseType;
    private final Integer prepTimeMinutes;
    private final List<String> allergyTags;

    public MenuItemCreatedEvent(MenuItem item) {
        super(item.getMenuItemId());
        this.menuCategoryId = item.getMenuCategoryId();
        this.name = item.getName();
        this.description = item.getDescription();
        this.price = item.getPrice();
        this.available = item.isAvailable();
        this.dishType = item.getDishType();
        this.courseType = item.getCourseType();
        this.prepTimeMinutes = item.getPrepTimeMinutes();
        this.allergyTags = item.getAllergyTags();
    }

    @Override
    public String getEventType() {
        return "menu.item.created";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("menuItemId", getAggregateId().toString());
        payload.put("menuCategoryId", menuCategoryId == null ? null : menuCategoryId.toString());
        payload.put("name", name);
        payload.put("description", description);
        payload.put("price", price);
        payload.put("available", available);
        payload.put("dishType", dishType);
        payload.put("courseType", courseType);
        payload.put("prepTimeMinutes", prepTimeMinutes);
        payload.put("allergyTags", allergyTags);
        return payload;
    }
}
