package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.entity.MenuCategory;
import com.hcmut.ordermenu.domain.repository.IMenuCategoryRepository;
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
public class SqlMenuCategoryRepository implements IMenuCategoryRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlMenuCategoryRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public MenuCategory save(MenuCategory menuCategory) {
        String sql = """
                INSERT INTO menu_categories (menu_category_id, name, display_order, active)
                VALUES (?, ?, ?, ?)
                ON CONFLICT (menu_category_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    display_order = EXCLUDED.display_order,
                    active = EXCLUDED.active
                """;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, menuCategory.getMenuCategoryId());
            statement.setString(2, menuCategory.getName());
            statement.setObject(3, menuCategory.getDisplayOrder());
            statement.setBoolean(4, menuCategory.isActive());
            statement.executeUpdate();
            return menuCategory;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save menu category", ex);
        }
    }

    @Override
    public MenuCategory findById(UUID menuCategoryId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("SELECT * FROM menu_categories WHERE menu_category_id = ?")) {
            statement.setObject(1, menuCategoryId);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find menu category", ex);
        }
    }

    @Override
    public List<MenuCategory> findAll() {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("SELECT * FROM menu_categories ORDER BY display_order NULLS LAST, name");
             ResultSet rs = statement.executeQuery()) {
            List<MenuCategory> categories = new ArrayList<>();
            while (rs.next()) {
                categories.add(map(rs));
            }
            return categories;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list menu categories", ex);
        }
    }

    @Override
    public void delete(UUID menuCategoryId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM menu_categories WHERE menu_category_id = ?")) {
            statement.setObject(1, menuCategoryId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete menu category", ex);
        }
    }

    private MenuCategory map(ResultSet rs) throws SQLException {
        return MenuCategory.restore(
                (UUID) rs.getObject("menu_category_id"),
                rs.getString("name"),
                (Integer) rs.getObject("display_order"),
                rs.getBoolean("active")
        );
    }
}
