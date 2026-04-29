package com.hcmut.ordermenu.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record OrderItemDto(
        UUID itemId,
        UUID menuItemId,
        int quantity,
        BigDecimal unitPrice,
        BigDecimal subtotal,
        List<String> modifiers,
        String specialInstructions
) {
}
