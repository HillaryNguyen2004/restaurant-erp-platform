package com.hcmut.ordermenu.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record CreateMenuItemRequest(
        String name,
        String description,
        UUID menuCategoryId,
        BigDecimal price,
        String dishType,
        String courseType,
        Integer prepTimeMinutes,
        List<String> allergyTags
) {
}
