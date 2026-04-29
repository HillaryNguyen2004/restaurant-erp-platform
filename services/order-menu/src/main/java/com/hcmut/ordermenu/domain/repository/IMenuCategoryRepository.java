package com.hcmut.ordermenu.domain.repository;

import com.hcmut.ordermenu.domain.entity.MenuCategory;

import java.util.List;
import java.util.UUID;

public interface IMenuCategoryRepository {
    MenuCategory save(MenuCategory menuCategory);

    MenuCategory findById(UUID menuCategoryId);

    List<MenuCategory> findAll();

    void delete(UUID menuCategoryId);
}
