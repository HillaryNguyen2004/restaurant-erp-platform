package com.hcmut.ordermenu.domain.entity;

import lombok.Getter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Getter
public class OrderItem {
    private UUID orderItemId;
    private UUID menuItemId;
    private Integer quantity;
    private BigDecimal price;
    private List<String> modifiers;
    private String specialInstructions;
    private String menuItemName;
    private String dishType;
    private String courseType;
    private List<String> allergyTags;
    private Integer prepTimeMinutes;

    public OrderItem(UUID menuItemId, Integer quantity, BigDecimal price, String specialInstructions) {
        this(menuItemId, quantity, price, List.of(), specialInstructions);
    }

    public OrderItem(UUID menuItemId, Integer quantity, BigDecimal price, List<String> modifiers, String specialInstructions) {
        this(menuItemId, quantity, price, modifiers, specialInstructions, null, null, null, List.of(), null);
    }

    public OrderItem(
            UUID menuItemId,
            Integer quantity,
            BigDecimal price,
            List<String> modifiers,
            String specialInstructions,
            String menuItemName,
            String dishType,
            String courseType,
            List<String> allergyTags,
            Integer prepTimeMinutes
    ) {
        this.orderItemId = UUID.randomUUID();
        this.menuItemId = menuItemId;
        this.quantity = quantity;
        this.price = price;
        this.modifiers = new ArrayList<>(modifiers == null ? List.of() : modifiers);
        this.specialInstructions = specialInstructions;
        this.menuItemName = defaultIfBlank(menuItemName, menuItemId == null ? "Unknown Item" : "Item " + menuItemId);
        this.dishType = defaultIfBlank(dishType, "default");
        this.courseType = defaultIfBlank(courseType, "MAIN").toUpperCase(Locale.ROOT);
        this.allergyTags = new ArrayList<>(allergyTags == null ? List.of() : allergyTags);
        this.prepTimeMinutes = prepTimeMinutes == null ? 10 : Math.max(1, prepTimeMinutes);
    }

    public static OrderItem restore(
            UUID orderItemId,
            UUID menuItemId,
            Integer quantity,
            BigDecimal price,
            List<String> modifiers,
            String specialInstructions,
            String menuItemName,
            String dishType,
            String courseType,
            List<String> allergyTags,
            Integer prepTimeMinutes
    ) {
        OrderItem item = new OrderItem(menuItemId, quantity, price, modifiers, specialInstructions, menuItemName, dishType, courseType, allergyTags, prepTimeMinutes);
        item.orderItemId = orderItemId;
        return item;
    }

    public void update(Integer quantity, List<String> modifiers, String specialInstructions) {
        this.quantity = quantity;
        this.modifiers = new ArrayList<>(modifiers == null ? List.of() : modifiers);
        this.specialInstructions = specialInstructions;
    }

    public BigDecimal subtotal() {
        return price.multiply(BigDecimal.valueOf(quantity));
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
