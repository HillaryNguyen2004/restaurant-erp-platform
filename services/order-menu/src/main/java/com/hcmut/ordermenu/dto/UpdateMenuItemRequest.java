package com.hcmut.ordermenu.dto;

import java.math.BigDecimal;
import java.util.List;

public record UpdateMenuItemRequest(
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
