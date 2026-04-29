package com.hcmut.ordermenu.dto;

import java.util.List;

public record MenuDto(
        List<MenuCategoryDto> categories,
        List<MenuItemDto> items
) {
}
