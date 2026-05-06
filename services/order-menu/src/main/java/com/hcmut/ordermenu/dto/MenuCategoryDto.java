package com.hcmut.ordermenu.dto;

import java.util.UUID;

public record MenuCategoryDto(
        UUID categoryId,
        String name,
        Integer displayOrder,
        boolean active
) {
}
