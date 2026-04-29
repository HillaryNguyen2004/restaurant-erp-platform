package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.enums.DiscountType;
import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.lang.reflect.Field;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.junit.jupiter.api.Assertions.assertTrue;

class InMemoryRepositoryTests {

    @Test
    void orderRepositorySavesAndFindsById() {
        InMemoryOrderRepository repository = new InMemoryOrderRepository();
        Order order = new Order(UUID.randomUUID(), List.of());
        UUID orderId = readUuidField(order, "orderId");

        repository.save(order);

        assertSame(order, repository.findById(orderId));
        assertNull(repository.findById(UUID.randomUUID()));
    }

    @Test
    void menuCategoryRepositorySavesAndReturnsSortedCategories() {
        InMemoryMenuCategoryRepository repository = new InMemoryMenuCategoryRepository();
        MenuCategory starters = new MenuCategory("Starters", 2, true);
        MenuCategory drinks = new MenuCategory("Drinks", 1, true);
        UUID startersId = readUuidField(starters, "menuCategoryId");
        UUID drinksId = readUuidField(drinks, "menuCategoryId");

        repository.save(starters);
        repository.save(drinks);

        assertSame(starters, repository.findById(startersId));
        assertSame(drinks, repository.findById(drinksId));
        assertNull(repository.findById(UUID.randomUUID()));
        assertEquals(List.of(drinks, starters), repository.findAll());
    }

    @Test
    void orderSessionRepositorySupportsTableAndStatusQueries() {
        InMemoryOrderSessionRepository repository = new InMemoryOrderSessionRepository();
        UUID tableId = UUID.randomUUID();

        OrderSession activeSession = OrderSession.create(tableId);
        OrderSession closedSession = OrderSession.create(tableId);
        closedSession.close();

        repository.save(activeSession);
        repository.save(closedSession);

        assertEquals(2, repository.findByTable(tableId).size());
        assertSame(activeSession, repository.findActiveByTable(tableId));
        assertEquals(1, repository.findByStatus(OrderSessionStatus.CLOSED).size());
    }

    @Test
    void menuItemRepositorySupportsSaveFindDelete() {
        InMemoryMenuItemRepository repository = new InMemoryMenuItemRepository();
        MenuItem item = new MenuItem("Steak", "Medium rare", BigDecimal.valueOf(10.5), true);
        UUID itemId = readUuidField(item, "menuItemId");

        repository.save(item);

        assertSame(item, repository.findById(itemId));
        assertEquals(1, repository.findAll().size());

        repository.delete(itemId);
        assertNull(repository.findById(itemId));
    }

    @Test
    void promotionRepositorySupportsActiveAndApplicableQueries() {
        InMemoryPromotionRepository repository = new InMemoryPromotionRepository();
        UUID itemId = UUID.randomUUID();
        var activePromo = new com.hcmut.ordermenu.domain.entity.Promotion(
                "Lunch Discount",
                DiscountType.PERCENTAGE,
                BigDecimal.valueOf(15),
                Instant.now().minusSeconds(60),
                Instant.now().plusSeconds(60),
                List.of(itemId),
                true
        );

        repository.save(activePromo);

        assertEquals(1, repository.findActive(Instant.now()).size());
        assertEquals(1, repository.findByApplicableItem(itemId).size());
    }

    @Test
    void availabilityCacheTracksAvailabilityFlags() {
        InMemoryAvailabilityCache cache = new InMemoryAvailabilityCache();
        UUID itemId = UUID.randomUUID();

        assertTrue(cache.isAvailable(itemId));
        cache.markUnavailable(itemId);
        assertFalse(cache.isAvailable(itemId));
        cache.markAvailable(itemId);
        assertTrue(cache.isAvailable(itemId));
    }

    private static UUID readUuidField(Object target, String fieldName) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            return (UUID) field.get(target);
        } catch (ReflectiveOperationException e) {
            throw new IllegalStateException("Unable to read field: " + fieldName, e);
        }
    }
}
