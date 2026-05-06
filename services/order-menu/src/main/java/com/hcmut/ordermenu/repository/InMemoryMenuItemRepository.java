package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryMenuItemRepository implements IMenuItemRepository {
    private final Map<UUID, MenuItem> menuItemMap = new ConcurrentHashMap<>();

    @Override
    public MenuItem save(MenuItem item) {
        menuItemMap.put(item.getMenuItemId(), item);
        return item;
    }

    @Override
    public MenuItem findById(UUID itemId) {
        return menuItemMap.get(itemId);
    }

    @Override
    public List<MenuItem> findAll() {
        return new ArrayList<>(menuItemMap.values());
    }

    @Override
    public List<MenuItem> findByCategory(UUID menuCategoryId) {
        List<MenuItem> matches = new ArrayList<>();
        for (MenuItem item : menuItemMap.values()) {
            if (menuCategoryId.equals(item.getMenuCategoryId())) {
                matches.add(item);
            }
        }
        return matches;
    }

    @Override
    public void delete(UUID itemId) {
        menuItemMap.remove(itemId);
    }
}
