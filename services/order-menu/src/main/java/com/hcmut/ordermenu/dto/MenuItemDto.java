package com.hcmut.ordermenu.dto;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

public record MenuItemDto(
        UUID itemId,
        UUID categoryId,
        String name,
        String description,
        BigDecimal price,
        boolean available,
        String dishType,
        String courseType,
        Integer prepTimeMinutes,
        List<String> allergyTags
) {
}
