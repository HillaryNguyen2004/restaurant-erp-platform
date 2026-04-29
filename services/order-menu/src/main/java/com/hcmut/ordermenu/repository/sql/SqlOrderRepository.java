package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.entity.Order;
import com.hcmut.ordermenu.domain.entity.OrderItem;
import com.hcmut.ordermenu.domain.enums.OrderStatus;
import com.hcmut.ordermenu.domain.repository.IOrderRepository;
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
public class SqlOrderRepository implements IOrderRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlOrderRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public Order save(Order order) {
        String orderSql = """
                INSERT INTO orders (order_id, order_session_id, order_time, status, cancellation_reason)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (order_id) DO UPDATE SET
                    order_session_id = EXCLUDED.order_session_id,
                    order_time = EXCLUDED.order_time,
                    status = EXCLUDED.status,
                    cancellation_reason = EXCLUDED.cancellation_reason
                """;
        String itemSql = """
                INSERT INTO order_items (
                    order_item_id, order_id, menu_item_id, quantity, price, modifiers, special_instructions,
                    menu_item_name, dish_type, course_type, allergy_tags, prep_time_minutes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = connectionFactory.getConnection()) {
            connection.setAutoCommit(false);
            try (var orderStatement = connection.prepareStatement(orderSql);
                 var deleteItems = connection.prepareStatement("DELETE FROM order_items WHERE order_id = ?");
                 var itemStatement = connection.prepareStatement(itemSql)) {
                orderStatement.setObject(1, order.getOrderId());
                orderStatement.setObject(2, order.getOrderSessionId());
                orderStatement.setTimestamp(3, SqlMapperSupport.timestamp(order.getOrderTime()));
                orderStatement.setString(4, order.getStatus().name());
                orderStatement.setString(5, order.getCancellationReason());
                orderStatement.executeUpdate();

                deleteItems.setObject(1, order.getOrderId());
                deleteItems.executeUpdate();

                for (OrderItem item : order.getOrderItems()) {
                    itemStatement.setObject(1, item.getOrderItemId());
                    itemStatement.setObject(2, order.getOrderId());
                    itemStatement.setObject(3, item.getMenuItemId());
                    itemStatement.setInt(4, item.getQuantity());
                    itemStatement.setBigDecimal(5, item.getPrice());
                    itemStatement.setArray(6, SqlMapperSupport.textArray(connection, item.getModifiers()));
                    itemStatement.setString(7, item.getSpecialInstructions());
                    itemStatement.setString(8, item.getMenuItemName());
                    itemStatement.setString(9, item.getDishType());
                    itemStatement.setString(10, item.getCourseType());
                    itemStatement.setArray(11, SqlMapperSupport.textArray(connection, item.getAllergyTags()));
                    itemStatement.setInt(12, item.getPrepTimeMinutes());
                    itemStatement.addBatch();
                }
                itemStatement.executeBatch();
                connection.commit();
                return order;
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save order", ex);
        }
    }

    @Override
    public Order findById(UUID orderId) {
        return findOne("SELECT * FROM orders WHERE order_id = ?", orderId);
    }

    @Override
    public List<Order> findBySession(UUID sessionId) {
        return findMany("SELECT * FROM orders WHERE order_session_id = ?", sessionId, null);
    }

    @Override
    public List<Order> findByStatus(OrderStatus status) {
        return findMany("SELECT * FROM orders WHERE status = ?", null, status);
    }

    @Override
    public void delete(UUID orderId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM orders WHERE order_id = ?")) {
            statement.setObject(1, orderId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete order", ex);
        }
    }

    private Order findOne(String sql, UUID id) {
        List<Order> orders = findMany(sql, id, null);
        return orders.isEmpty() ? null : orders.getFirst();
    }

    private List<Order> findMany(String sql, UUID id, OrderStatus status) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            if (id != null) {
                statement.setObject(1, id);
            } else if (status != null) {
                statement.setString(1, status.name());
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<Order> orders = new ArrayList<>();
                while (rs.next()) {
                    UUID orderId = (UUID) rs.getObject("order_id");
                    orders.add(Order.restore(
                            orderId,
                            (UUID) rs.getObject("order_session_id"),
                            SqlMapperSupport.instant(rs, "order_time"),
                            OrderStatus.valueOf(rs.getString("status")),
                            findItems(connection, orderId),
                            rs.getString("cancellation_reason")
                    ));
                }
                return orders;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list orders", ex);
        }
    }

    private List<OrderItem> findItems(Connection connection, UUID orderId) throws SQLException {
        try (var statement = connection.prepareStatement("SELECT * FROM order_items WHERE order_id = ? ORDER BY order_item_id")) {
            statement.setObject(1, orderId);
            try (ResultSet rs = statement.executeQuery()) {
                List<OrderItem> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(OrderItem.restore(
                            (UUID) rs.getObject("order_item_id"),
                            (UUID) rs.getObject("menu_item_id"),
                            rs.getInt("quantity"),
                            rs.getBigDecimal("price"),
                            SqlMapperSupport.stringList(rs, "modifiers"),
                            rs.getString("special_instructions"),
                            rs.getString("menu_item_name"),
                            rs.getString("dish_type"),
                            rs.getString("course_type"),
                            SqlMapperSupport.stringList(rs, "allergy_tags"),
                            rs.getInt("prep_time_minutes")
                    ));
                }
                return items;
            }
        }
    }
}
