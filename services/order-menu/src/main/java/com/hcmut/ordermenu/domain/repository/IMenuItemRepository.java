package com.hcmut.ordermenu.domain.repository;

import com.hcmut.ordermenu.domain.entity.MenuItem;

import java.util.List;
import java.util.UUID;

public interface IMenuItemRepository {
    MenuItem save(MenuItem item);

    MenuItem findById(UUID itemId);

    List<MenuItem> findAll();

    List<MenuItem> findByCategory(UUID menuCategoryId);

    void delete(UUID itemId);
}
