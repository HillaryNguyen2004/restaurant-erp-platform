package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.repository.IMenuItemRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
@DependsOn("flywayMigrationRunner")
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class SqlMenuItemRepository implements IMenuItemRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlMenuItemRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public MenuItem save(MenuItem item) {
        String sql = """
                INSERT INTO menu_items (
                    menu_item_id, menu_category_id, name, description, price, available,
                    dish_type, course_type, prep_time_minutes, allergy_tags
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (menu_item_id) DO UPDATE SET
                    menu_category_id = EXCLUDED.menu_category_id,
                    name = EXCLUDED.name,
                    description = EXCLUDED.description,
                    price = EXCLUDED.price,
                    available = EXCLUDED.available,
                    dish_type = EXCLUDED.dish_type,
                    course_type = EXCLUDED.course_type,
                    prep_time_minutes = EXCLUDED.prep_time_minutes,
                    allergy_tags = EXCLUDED.allergy_tags
                """;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, item.getMenuItemId());
            statement.setObject(2, item.getMenuCategoryId());
            statement.setString(3, item.getName());
            statement.setString(4, item.getDescription());
            statement.setBigDecimal(5, item.getPrice());
            statement.setBoolean(6, item.isAvailable());
            statement.setString(7, item.getDishType());
            statement.setString(8, item.getCourseType());
            statement.setInt(9, item.getPrepTimeMinutes());
            statement.setArray(10, SqlMapperSupport.textArray(connection, item.getAllergyTags()));
            statement.executeUpdate();
            return item;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save menu item", ex);
        }
    }

    @Override
    public MenuItem findById(UUID itemId) {
        return findOne("SELECT * FROM menu_items WHERE menu_item_id = ?", itemId);
    }

    @Override
    public List<MenuItem> findAll() {
        return findMany("SELECT * FROM menu_items ORDER BY name", null);
    }

    @Override
    public List<MenuItem> findByCategory(UUID menuCategoryId) {
        return findMany("SELECT * FROM menu_items WHERE menu_category_id = ? ORDER BY name", menuCategoryId);
    }

    @Override
    public void delete(UUID itemId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM menu_items WHERE menu_item_id = ?")) {
            statement.setObject(1, itemId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete menu item", ex);
        }
    }

    private MenuItem findOne(String sql, UUID id) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find menu item", ex);
        }
    }

    private List<MenuItem> findMany(String sql, UUID id) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            if (id != null) {
                statement.setObject(1, id);
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<MenuItem> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(map(rs));
                }
                return items;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list menu items", ex);
        }
    }

    private MenuItem map(ResultSet rs) throws SQLException {
        return MenuItem.restore(
                (UUID) rs.getObject("menu_item_id"),
                (UUID) rs.getObject("menu_category_id"),
                rs.getString("name"),
                rs.getString("description"),
                rs.getBigDecimal("price"),
                rs.getBoolean("available"),
                rs.getString("dish_type"),
                rs.getString("course_type"),
                rs.getInt("prep_time_minutes"),
                SqlMapperSupport.stringList(rs, "allergy_tags")
        );
    }
}
