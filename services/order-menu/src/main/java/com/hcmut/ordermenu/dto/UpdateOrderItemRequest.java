package com.hcmut.ordermenu.dto;

import java.util.List;

public record UpdateOrderItemRequest(
        int quantity,
        List<String> modifiers,
        String specialInstructions
) {
}
