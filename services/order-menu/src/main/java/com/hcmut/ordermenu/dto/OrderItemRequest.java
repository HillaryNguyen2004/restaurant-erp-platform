package com.hcmut.ordermenu.dto;

import java.util.List;
import java.util.UUID;

public record OrderItemRequest(
        UUID menuItemId,
        int quantity,
        List<String> modifiers,
        String specialInstructions
) {
}
