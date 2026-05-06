package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class OrderItem {
    private final String orderItemId;
    private final String menuItemId;
    private final String menuItemName;
    private final String dishType;
    private final String courseType;
    private final int quantity;
    private final String specialInstructions;
    private final List<String> allergyTags;
    private final int prepTimeMinutes;

    public OrderItem(
            String orderItemId,
            String menuItemId,
            String menuItemName,
            String dishType,
            String courseType,
            int quantity,
            String specialInstructions,
            List<String> allergyTags,
            int prepTimeMinutes
    ) {
        this.orderItemId = orderItemId;
        this.menuItemId = menuItemId;
        this.menuItemName = menuItemName;
        this.dishType = dishType;
        this.courseType = courseType;
        this.quantity = quantity;
        this.specialInstructions = specialInstructions;
        this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
        this.prepTimeMinutes = prepTimeMinutes;
    }
}
