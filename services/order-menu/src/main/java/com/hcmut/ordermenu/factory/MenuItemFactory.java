package com.hcmut.ordermenu.factory;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.dto.CreateMenuItemRequest;
import org.springframework.stereotype.Component;

@Component
public class MenuItemFactory {
    public MenuItem createMenuItem(CreateMenuItemRequest request, MenuCategory menuCategory) {
        return new MenuItem(
                menuCategory.getMenuCategoryId(),
                request.name(),
                request.description(),
                request.price(),
                true,
                request.dishType(),
                request.courseType(),
                request.prepTimeMinutes(),
                request.allergyTags()
        );
    }
}
