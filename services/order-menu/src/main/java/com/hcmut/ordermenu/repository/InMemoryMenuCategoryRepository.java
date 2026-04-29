package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryMenuCategoryRepository implements IMenuCategoryRepository {
    private final Map<UUID, MenuCategory> menuCategoryMap = new ConcurrentHashMap<>();

    @Override
    public MenuCategory save(MenuCategory menuCategory) {
        menuCategoryMap.put(menuCategory.getMenuCategoryId(), menuCategory);
        return menuCategory;
    }

    @Override
    public MenuCategory findById(UUID menuCategoryId) {
        return menuCategoryMap.get(menuCategoryId);
    }

    @Override
    public List<MenuCategory> findAll() {
        List<MenuCategory> categories = new ArrayList<>(menuCategoryMap.values());
        categories.sort(Comparator.comparing(MenuCategory::getDisplayOrder, Comparator.nullsLast(Integer::compareTo))
                .thenComparing(MenuCategory::getName, Comparator.nullsLast(String::compareTo)));
        return categories;
    }

    @Override
    public void delete(UUID menuCategoryId) {
        menuCategoryMap.remove(menuCategoryId);
    }
}
