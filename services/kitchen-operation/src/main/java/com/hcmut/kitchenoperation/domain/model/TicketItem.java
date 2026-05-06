package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public class TicketItem {
    private final String id;
    private final String orderItemId;
    private final String menuItemName;
    private final String dishType;
    private final int quantity;
    private final String specialInstructions;
    private final List<String> allergyTags;
    private final int prepTimeMinutes;

    public TicketItem(
            String orderItemId,
            String menuItemName,
            String dishType,
            int quantity,
            String specialInstructions,
            List<String> allergyTags,
            int prepTimeMinutes
    ) {
        this.id = UUID.randomUUID().toString();
        this.orderItemId = orderItemId;
        this.menuItemName = menuItemName;
        this.dishType = dishType;
        this.quantity = quantity;
        this.specialInstructions = specialInstructions;
        this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
        this.prepTimeMinutes = prepTimeMinutes;
    }

    public boolean hasAllergyTags() {
        return !allergyTags.isEmpty();
    }

    public String getDisplayText() {
        return quantity + "x " + menuItemName;
    }
}
