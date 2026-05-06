package com.hcmut.ordermenu.validator;

import com.hcmut.ordermenu.domain.enums.DiscountType;
import com.hcmut.ordermenu.dto.CreatePromotionRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class PromotionValidator {
    public void validateCreateRequest(CreatePromotionRequest request) {
        if (request.name() == null || request.name().isBlank()) {
            throw new IllegalArgumentException("Promotion name is required");
        }

        validateDateRange(request.validFrom(), request.validTo());
        validateDiscountValue(request.discountType(), request.discountValue());
    }

    public void validateDateRange(java.time.Instant validFrom, java.time.Instant validTo) {
        if (validFrom != null && validTo != null && validTo.isBefore(validFrom)) {
            throw new IllegalArgumentException("validTo must be after validFrom");
        }
    }

    public void validateDiscountValue(DiscountType type, BigDecimal value) {
        if (value == null || value.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Discount value must be greater than zero");
        }

        if (type == DiscountType.PERCENTAGE && value.compareTo(BigDecimal.valueOf(100)) > 0) {
            throw new IllegalArgumentException("Percentage discount must be <= 100");
        }
    }
}
