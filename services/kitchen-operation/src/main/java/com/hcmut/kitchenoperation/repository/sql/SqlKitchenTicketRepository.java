package com.hcmut.kitchenoperation.repository.sql;

import com.hcmut.kitchenoperation.config.SqlConnectionFactory;
import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.TicketItem;
import com.hcmut.kitchenoperation.domain.repository.IKitchenTicketRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.DependsOn;
import org.springframework.stereotype.Repository;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
@DependsOn("flywayMigrationRunner")
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class SqlKitchenTicketRepository implements IKitchenTicketRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlKitchenTicketRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public KitchenTicket findById(String ticketId) {
        List<KitchenTicket> tickets = findMany("SELECT * FROM kitchen_tickets WHERE ticket_id = ?", ticketId, null);
        return tickets.isEmpty() ? null : tickets.getFirst();
    }

    @Override
    public List<KitchenTicket> findByStationId(String stationId) {
        return findMany("SELECT * FROM kitchen_tickets WHERE station_id = ? ORDER BY created_at", stationId, null);
    }

    @Override
    public List<KitchenTicket> findActiveByStationId(String stationId) {
        return findMany("""
                SELECT * FROM kitchen_tickets
                WHERE station_id = ? AND status NOT IN ('COMPLETED', 'CANCELLED')
                ORDER BY created_at
                """, stationId, null);
    }

    @Override
    public List<KitchenTicket> findByOrderId(String orderId) {
        return findMany("SELECT * FROM kitchen_tickets WHERE order_id = ? ORDER BY created_at", orderId, null);
    }

    @Override
    public List<KitchenTicket> findByCourseType(String orderId, String courseType) {
        return findMany("SELECT * FROM kitchen_tickets WHERE order_id = ? AND course_type = ? ORDER BY created_at", orderId, courseType);
    }

    @Override
    public KitchenTicket save(KitchenTicket ticket) {
        String ticketSql = """
                INSERT INTO kitchen_tickets (
                    ticket_id, order_id, table_number, station_id, course_type, status, priority,
                    prep_time_minutes, special_instructions, created_at, started_at, completed_at
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT (ticket_id) DO UPDATE SET
                    order_id = EXCLUDED.order_id,
                    table_number = EXCLUDED.table_number,
                    station_id = EXCLUDED.station_id,
                    course_type = EXCLUDED.course_type,
                    status = EXCLUDED.status,
                    priority = EXCLUDED.priority,
                    prep_time_minutes = EXCLUDED.prep_time_minutes,
                    special_instructions = EXCLUDED.special_instructions,
                    created_at = EXCLUDED.created_at,
                    started_at = EXCLUDED.started_at,
                    completed_at = EXCLUDED.completed_at
                """;
        String itemSql = """
                INSERT INTO kitchen_ticket_items (
                    ticket_id, item_index, menu_item_name, dish_type, quantity,
                    special_instructions, allergy_tags, prep_time_minutes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """;
        try (Connection connection = connectionFactory.getConnection()) {
            connection.setAutoCommit(false);
            try (var ticketStatement = connection.prepareStatement(ticketSql);
                 var deleteItems = connection.prepareStatement("DELETE FROM kitchen_ticket_items WHERE ticket_id = ?");
                 var itemStatement = connection.prepareStatement(itemSql)) {
                ticketStatement.setString(1, ticket.getId());
                ticketStatement.setString(2, ticket.getOrderId());
                ticketStatement.setString(3, ticket.getTableNumber());
                ticketStatement.setString(4, ticket.getStationId());
                ticketStatement.setString(5, ticket.getCourseType());
                ticketStatement.setString(6, ticket.getStatus());
                ticketStatement.setInt(7, ticket.getPriority());
                ticketStatement.setInt(8, ticket.getPrepTimeMinutes());
                ticketStatement.setString(9, ticket.getSpecialInstructions());
                ticketStatement.setTimestamp(10, SqlMapperSupport.timestamp(ticket.getCreatedAt()));
                ticketStatement.setTimestamp(11, SqlMapperSupport.timestamp(ticket.getStartedAt()));
                ticketStatement.setTimestamp(12, SqlMapperSupport.timestamp(ticket.getCompletedAt()));
                ticketStatement.executeUpdate();

                deleteItems.setString(1, ticket.getId());
                deleteItems.executeUpdate();

                int index = 0;
                for (TicketItem item : ticket.getItems()) {
                    itemStatement.setString(1, ticket.getId());
                    itemStatement.setInt(2, index++);
                    itemStatement.setString(3, item.getMenuItemName());
                    itemStatement.setString(4, item.getDishType());
                    itemStatement.setInt(5, item.getQuantity());
                    itemStatement.setString(6, item.getSpecialInstructions());
                    itemStatement.setArray(7, SqlMapperSupport.textArray(connection, item.getAllergyTags()));
                    itemStatement.setInt(8, item.getPrepTimeMinutes());
                    itemStatement.addBatch();
                }
                itemStatement.executeBatch();
                connection.commit();
                return ticket;
            } catch (SQLException ex) {
                connection.rollback();
                throw ex;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save kitchen ticket", ex);
        }
    }

    @Override
    public void saveAll(List<KitchenTicket> tickets) {
        for (KitchenTicket ticket : tickets) {
            save(ticket);
        }
    }

    @Override
    public KitchenTicket update(KitchenTicket ticket) {
        return save(ticket);
    }

    @Override
    public void delete(String ticketId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM kitchen_tickets WHERE ticket_id = ?")) {
            statement.setString(1, ticketId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete kitchen ticket", ex);
        }
    }

    private List<KitchenTicket> findMany(String sql, String first, String second) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setString(1, first);
            if (second != null) {
                statement.setString(2, second);
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<KitchenTicket> tickets = new ArrayList<>();
                while (rs.next()) {
                    String ticketId = rs.getString("ticket_id");
                    tickets.add(KitchenTicket.restore(
                            ticketId,
                            rs.getString("order_id"),
                            rs.getString("table_number"),
                            rs.getString("station_id"),
                            findItems(connection, ticketId),
                            rs.getString("course_type"),
                            rs.getString("status"),
                            rs.getInt("priority"),
                            rs.getInt("prep_time_minutes"),
                            rs.getString("special_instructions"),
                            SqlMapperSupport.instant(rs, "created_at"),
                            SqlMapperSupport.instant(rs, "started_at"),
                            SqlMapperSupport.instant(rs, "completed_at")
                    ));
                }
                return tickets;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list kitchen tickets", ex);
        }
    }

    private List<TicketItem> findItems(Connection connection, String ticketId) throws SQLException {
        try (var statement = connection.prepareStatement("SELECT * FROM kitchen_ticket_items WHERE ticket_id = ? ORDER BY item_index")) {
            statement.setString(1, ticketId);
            try (ResultSet rs = statement.executeQuery()) {
                List<TicketItem> items = new ArrayList<>();
                while (rs.next()) {
                    items.add(new TicketItem(
                            null,
                            rs.getString("menu_item_name"),
                            rs.getString("dish_type"),
                            rs.getInt("quantity"),
                            rs.getString("special_instructions"),
                            SqlMapperSupport.stringList(rs, "allergy_tags"),
                            rs.getInt("prep_time_minutes")
                    ));
                }
                return items;
            }
        }
    }
}
