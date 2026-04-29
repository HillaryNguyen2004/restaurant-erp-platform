package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.enums.DiscountType;
import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
@DependsOn("flywayMigrationRunner")
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class SqlPromotionRepository implements IPromotionRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlPromotionRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public Promotion save(Promotion promotion) {
        String sql = """
                INSERT INTO promotions (promotion_id, name, discount_type, discount_value, valid_from, valid_to, active)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (promotion_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    discount_type = EXCLUDED.discount_type,
                    discount_value = EXCLUDED.discount_value,
                    valid_from = EXCLUDED.valid_from,
                    valid_to = EXCLUDED.valid_to,
                    active = EXCLUDED.active
                """;
        try (Connection connection = connectionFactory.getConnection()) {
            connection.setAutoCommit(false);
            try (var statement = connection.prepareStatement(sql);
                 var deleteItems = connection.prepareStatement("DELETE FROM promotion_items WHERE promotion_id = ?");
                 var itemStatement = connection.prepareStatement("INSERT INTO promotion_items (promotion_id, menu_item_id) VALUES (?, ?)")) {
                statement.setObject(1, promotion.getId());
                statement.setString(2, promotion.getName());
                statement.setString(3, promotion.getDiscountType().name());
                statement.setBigDecimal(4, promotion.getDiscountValue());
                statement.setTimestamp(5, SqlMapperSupport.timestamp(promotion.getValidFrom()));
                statement.setTimestamp(6, SqlMapperSupport.timestamp(promotion.getValidTo()));
                statement.setBoolean(7, promotion.isActive());
                statement.executeUpdate();

                deleteItems.setObject(1, promotion.getId());
                deleteItems.executeUpdate();
                for (UUID itemId : promotion.getApplicableItems()) {
                    itemStatement.setObject(1, promotion.getId());
                    itemStatement.setObject(2, itemId);
                    itemStatement.addBatch();
                }
                itemStatement.executeBatch();
                connection.commit();
                return promotion;
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save promotion", ex);
        }
    }

    @Override
    public Promotion findById(UUID promotionId) {
        List<Promotion> promotions = findMany("SELECT * FROM promotions WHERE promotion_id = ?", promotionId, null);
        return promotions.isEmpty() ? null : promotions.getFirst();
    }

    @Override
    public List<Promotion> findActive(Instant now) {
        return findMany("""
                SELECT * FROM promotions
                WHERE active = true
                  AND (valid_from IS NULL OR valid_from <= ?)
                  AND (valid_to IS NULL OR valid_to >= ?)
                """, null, now);
    }

    @Override
    public List<Promotion> findByApplicableItem(UUID itemId) {
        return findMany("""
                SELECT p.* FROM promotions p
                WHERE NOT EXISTS (SELECT 1 FROM promotion_items pi WHERE pi.promotion_id = p.promotion_id)
                   OR EXISTS (SELECT 1 FROM promotion_items pi WHERE pi.promotion_id = p.promotion_id AND pi.menu_item_id = ?)
                """, itemId, null);
    }

    @Override
    public void delete(UUID promotionId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM promotions WHERE promotion_id = ?")) {
            statement.setObject(1, promotionId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete promotion", ex);
        }
    }

    private List<Promotion> findMany(String sql, UUID id, Instant now) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            if (id != null) {
                statement.setObject(1, id);
            }
            if (now != null) {
                statement.setTimestamp(1, SqlMapperSupport.timestamp(now));
                statement.setTimestamp(2, SqlMapperSupport.timestamp(now));
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<Promotion> promotions = new ArrayList<>();
                while (rs.next()) {
                    UUID promotionId = (UUID) rs.getObject("promotion_id");
                    promotions.add(Promotion.restore(
                            promotionId,
                            rs.getString("name"),
                            DiscountType.valueOf(rs.getString("discount_type")),
                            rs.getBigDecimal("discount_value"),
                            SqlMapperSupport.instant(rs, "valid_from"),
                            SqlMapperSupport.instant(rs, "valid_to"),
                            findApplicableItems(connection, promotionId),
                            rs.getBoolean("active")
                    ));
                }
                return promotions;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list promotions", ex);
        }
    }

    private List<UUID> findApplicableItems(Connection connection, UUID promotionId) throws SQLException {
        try (var statement = connection.prepareStatement("SELECT menu_item_id FROM promotion_items WHERE promotion_id = ?")) {
            statement.setObject(1, promotionId);
            try (ResultSet rs = statement.executeQuery()) {
                List<UUID> itemIds = new ArrayList<>();
                while (rs.next()) {
                    itemIds.add((UUID) rs.getObject("menu_item_id"));
                }
                return itemIds;
            }
        }
    }
}
