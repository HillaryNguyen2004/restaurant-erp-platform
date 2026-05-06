package com.hcmut.ordermenu.dto;

import com.hcmut.ordermenu.domain.enums.DiscountType;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CreatePromotionRequest(
        String name,
        DiscountType discountType,
        BigDecimal discountValue,
        Instant validFrom,
        Instant validTo,
        List<UUID> applicableItems,
        boolean active
) {
}
