package com.hcmut.ordermenu.service.menu;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class MenuCategoryDeleter {
    private final IMenuCategoryRepository menuCategoryRepository;

    public void delete(UUID categoryId) {
        MenuCategory category = menuCategoryRepository.findById(categoryId);
        if (category == null) {
            throw new IllegalArgumentException("Menu category not found: " + categoryId);
        }

        menuCategoryRepository.delete(categoryId);
    }
}
