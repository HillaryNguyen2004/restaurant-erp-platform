package com.hcmut.ordermenu.dto;

public record UpdateMenuCategoryRequest(
        String name,
        Integer displayOrder,
        Boolean active
) {
}
