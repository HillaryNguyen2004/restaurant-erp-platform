package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.repository.IAvailabilityCache;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.SQLException;
import java.util.UUID;

@Repository
@DependsOn("flywayMigrationRunner")
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class SqlAvailabilityCache implements IAvailabilityCache {
    private final SqlConnectionFactory connectionFactory;

    public SqlAvailabilityCache(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public void markUnavailable(UUID itemId) {
        save(itemId, false);
    }

    @Override
    public void markAvailable(UUID itemId) {
        save(itemId, true);
    }

    @Override
    public boolean isAvailable(UUID itemId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("SELECT available FROM availability_cache WHERE menu_item_id = ?")) {
            statement.setObject(1, itemId);
            try (var rs = statement.executeQuery()) {
                return !rs.next() || rs.getBoolean("available");
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to read availability cache", ex);
        }
    }

    private void save(UUID itemId, boolean available) {
        String sql = """
                INSERT INTO availability_cache (menu_item_id, available)
                VALUES (?, ?)
                ON CONFLICT (menu_item_id) DO UPDATE SET available = EXCLUDED.available
                """;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, itemId);
            statement.setBoolean(2, available);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to update availability cache", ex);
        }
    }
}
