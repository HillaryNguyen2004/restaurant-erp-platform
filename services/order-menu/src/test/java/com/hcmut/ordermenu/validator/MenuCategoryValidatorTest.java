package com.hcmut.ordermenu.validator;

import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@DisplayName("MenuCategoryValidator Tests")
class MenuCategoryValidatorTest {

    @Mock
    private IMenuCategoryRepository menuCategoryRepository;

    private MenuCategoryValidator validator;

    @BeforeEach
    void setUp() {
        validator = new MenuCategoryValidator(menuCategoryRepository);
    }

    @Test
    @DisplayName("Should validate display order within valid range")
    void testValidDisplayOrderRange() {
        when(menuCategoryRepository.findAll()).thenReturn(Collections.emptyList());
        
        // Should not throw exception for valid orders
        assertDoesNotThrow(() -> validator.validateDisplayOrderForCreation(0));
        assertDoesNotThrow(() -> validator.validateDisplayOrderForCreation(1));
        assertDoesNotThrow(() -> validator.validateDisplayOrderForCreation(9999));
    }

    @Test
    @DisplayName("Should reject negative display order")
    void testNegativeDisplayOrder() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForCreation(-1)
        );
        assertTrue(exception.getMessage().contains("must be >= 0"));
    }

    @Test
    @DisplayName("Should reject display order exceeding maximum")
    void testExceedsMaximumDisplayOrder() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForCreation(10000)
        );
        assertTrue(exception.getMessage().contains("must be <= 9999"));
    }

    @Test
    @DisplayName("Should reject null display order")
    void testNullDisplayOrder() {
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForCreation(null)
        );
        assertTrue(exception.getMessage().contains("cannot be null"));
    }

    @Test
    @DisplayName("Should reject duplicate display order on creation")
    void testDuplicateDisplayOrderOnCreation() {
        MenuCategory existingCategory = new MenuCategory("Appetizers", 1, true);
        when(menuCategoryRepository.findAll()).thenReturn(List.of(existingCategory));

        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForCreation(1)
        );
        assertTrue(exception.getMessage().contains("already in use"));
    }

    @Test
    @DisplayName("Should reject duplicate display order on update (different category)")
    void testDuplicateDisplayOrderOnUpdate() {
        UUID categoryId1 = UUID.randomUUID();
        UUID categoryId2 = UUID.randomUUID();
        
        MenuCategory category1 = new MenuCategory("Appetizers", 1, true);
        MenuCategory category2 = new MenuCategory("Mains", 2, true);
        category1.getClass().getDeclaredFields();

        when(menuCategoryRepository.findAll()).thenReturn(Arrays.asList(category1, category2));

        // Trying to update category2 to have same order as category1 should fail
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForUpdate(1, categoryId2)
        );
        assertTrue(exception.getMessage().contains("already in use"));
    }

    @Test
    @DisplayName("Should allow update to same display order when updating same category")
    void testUpdateSameCategoryWithSameOrder() {
        MenuCategory category = new MenuCategory("Appetizers", 1, true);
        UUID categoryId = category.getMenuCategoryId();

        when(menuCategoryRepository.findAll()).thenReturn(List.of(category));

        // Should not throw exception when updating same category
        assertDoesNotThrow(() -> validator.validateDisplayOrderForUpdate(1, categoryId));
    }

    @Test
    @DisplayName("Should calculate next available display order correctly")
    void testGetNextAvailableDisplayOrder() {
        MenuCategory cat1 = new MenuCategory("Appetizers", 0, true);
        MenuCategory cat2 = new MenuCategory("Mains", 1, true);
        MenuCategory cat3 = new MenuCategory("Desserts", 3, true);

        when(menuCategoryRepository.findAll()).thenReturn(Arrays.asList(cat1, cat2, cat3));

        Integer nextOrder = validator.getNextAvailableDisplayOrder();
        assertEquals(4, nextOrder, "Next order should be 4 (max + 1)");
    }

    @Test
    @DisplayName("Should return 0 as next order when no categories exist")
    void testGetNextAvailableDisplayOrderEmpty() {
        when(menuCategoryRepository.findAll()).thenReturn(Collections.emptyList());

        Integer nextOrder = validator.getNextAvailableDisplayOrder();
        assertEquals(0, nextOrder, "First order should be 0");
    }

    @Test
    @DisplayName("Should handle non-sequential display orders (gaps allowed)")
    void testNonSequentialDisplayOrders() {
        MenuCategory cat1 = new MenuCategory("Appetizers", 1, true);
        MenuCategory cat2 = new MenuCategory("Mains", 5, true);
        MenuCategory cat3 = new MenuCategory("Desserts", 10, true);

        when(menuCategoryRepository.findAll()).thenReturn(Arrays.asList(cat1, cat2, cat3));

        // Should not reject non-sequential but unique orders
        assertDoesNotThrow(() -> validator.validateDisplayOrderForCreation(7));
        assertDoesNotThrow(() -> validator.validateDisplayOrderForCreation(100));
    }

    @Test
    @DisplayName("Should handle display orders with same values correctly")
    void testSameDisplayOrderDetection() {
        MenuCategory cat1 = new MenuCategory("Appetizers", 1, true);
        MenuCategory cat2 = new MenuCategory("Mains", 1, true); // DUPLICATE!

        when(menuCategoryRepository.findAll()).thenReturn(Arrays.asList(cat1, cat2));

        // Any new category trying to use order 1 should fail
        IllegalArgumentException exception = assertThrows(
                IllegalArgumentException.class,
                () -> validator.validateDisplayOrderForCreation(1)
        );
        assertTrue(exception.getMessage().contains("already in use"));
    }
}
