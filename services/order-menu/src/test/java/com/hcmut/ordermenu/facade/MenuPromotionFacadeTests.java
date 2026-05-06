package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.enums.DiscountType;
import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import com.hcmut.ordermenu.dto.CreateMenuItemRequest;
import com.hcmut.ordermenu.dto.CreatePromotionRequest;
import com.hcmut.ordermenu.dto.UpdateMenuItemRequest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

@SpringBootTest
class MenuPromotionFacadeTests {

    @Autowired
    private MenuFacade menuFacade;

    @Autowired
    private PromotionFacade promotionFacade;

    @Autowired
    private IMenuCategoryRepository menuCategoryRepository;

    @Test
    void createUpdateAndToggleMenuItem() {
        MenuCategory category = new MenuCategory("Main", 1, true);
        menuCategoryRepository.save(category);

        var created = menuFacade.createMenuItem(new CreateMenuItemRequest(
                "Burger",
                "Cheese burger",
                category.getMenuCategoryId(),
                BigDecimal.valueOf(7.5),
                "burger",
                "MAIN",
                12,
                List.of("dairy")
        ));

        assertNotNull(created.itemId());
        assertEquals(category.getMenuCategoryId(), created.categoryId());
        assertTrue(created.available());

        var updated = menuFacade.updateMenuItem(created.itemId(), new UpdateMenuItemRequest(
                "Burger Deluxe",
                "Cheese burger with bacon",
                BigDecimal.valueOf(9.25),
                false,
                "burger",
                "MAIN",
                15,
                List.of("dairy")
        ));

        assertEquals("Burger Deluxe", updated.name());
        assertFalse(updated.available());
        assertEquals("burger", updated.dishType());
        assertEquals("MAIN", updated.courseType());
        assertEquals(15, updated.prepTimeMinutes());

        menuFacade.markItemAvailable(created.itemId());
        assertTrue(menuFacade.getMenuItem(created.itemId()).available());
    }

    @Test
    void createAndQueryPromotion() {
        var request = new CreatePromotionRequest(
                "Lunch Promo",
                DiscountType.PERCENTAGE,
                BigDecimal.valueOf(10),
                Instant.now().minusSeconds(60),
                Instant.now().plusSeconds(60),
                List.of(),
                true
        );

        var created = promotionFacade.createPromotion(request);
        assertNotNull(created.promotionId());
        assertTrue(created.active());
        assertFalse(promotionFacade.getActivePromotions().isEmpty());
    }
}
