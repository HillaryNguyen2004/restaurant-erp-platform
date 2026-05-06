package com.hcmut.ordermenu.dto;

public record CreateMenuCategoryRequest(
        String name,
        Integer displayOrder
) {
}
