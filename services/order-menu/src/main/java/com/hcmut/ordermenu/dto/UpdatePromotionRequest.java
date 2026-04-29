package com.hcmut.ordermenu.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record UpdatePromotionRequest(
        String name,
        BigDecimal discountValue,
        Instant validFrom,
        Instant validTo,
        List<UUID> applicableItems,
        boolean active
) {
}
