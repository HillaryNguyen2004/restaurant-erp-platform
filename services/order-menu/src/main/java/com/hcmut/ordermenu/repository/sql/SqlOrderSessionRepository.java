package com.hcmut.ordermenu.repository.sql;

import com.hcmut.ordermenu.config.SqlConnectionFactory;
import com.hcmut.ordermenu.domain.entity.OrderSession;
import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;
import com.hcmut.ordermenu.domain.repository.IOrderSessionRepository;
import com.hcmut.ordermenu.domain.valueobject.TimeRange;
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
public class SqlOrderSessionRepository implements IOrderSessionRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlOrderSessionRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @Override
    public OrderSession save(OrderSession orderSession) {
        String sql = """
                INSERT INTO order_sessions (order_session_id, table_id, status, start_time, end_time)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (order_session_id) DO UPDATE SET
                    table_id = EXCLUDED.table_id,
                    status = EXCLUDED.status,
                    start_time = EXCLUDED.start_time,
                    end_time = EXCLUDED.end_time
                """;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, orderSession.getOrderSessionId());
            statement.setObject(2, orderSession.getTableId());
            statement.setString(3, orderSession.getStatus().name());
            statement.setTimestamp(4, SqlMapperSupport.timestamp(orderSession.getTimeRange().getStartTime()));
            statement.setTimestamp(5, SqlMapperSupport.timestamp(orderSession.getTimeRange().getEndTime()));
            statement.executeUpdate();
            return orderSession;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save order session", ex);
        }
    }

    @Override
    public OrderSession findById(UUID orderSessionId) {
        return findOne("SELECT * FROM order_sessions WHERE order_session_id = ?", orderSessionId);
    }

    @Override
    public List<OrderSession> findByTable(UUID tableId) {
        return findMany("SELECT * FROM order_sessions WHERE table_id = ?", tableId, null);
    }

    @Override
    public OrderSession findActiveByTable(UUID tableId) {
        List<OrderSession> matches = findMany("SELECT * FROM order_sessions WHERE table_id = ? AND status = ?", tableId, OrderSessionStatus.ACTIVE);
        return matches.isEmpty() ? null : matches.getFirst();
    }

    @Override
    public List<OrderSession> findByStatus(OrderSessionStatus status) {
        return findMany("SELECT * FROM order_sessions WHERE status = ?", null, status);
    }

    @Override
    public void delete(UUID orderSessionId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM order_sessions WHERE order_session_id = ?")) {
            statement.setObject(1, orderSessionId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete order session", ex);
        }
    }

    private OrderSession findOne(String sql, UUID id) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setObject(1, id);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find order session", ex);
        }
    }

    private List<OrderSession> findMany(String sql, UUID id, OrderSessionStatus status) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            int index = 1;
            if (id != null) {
                statement.setObject(index++, id);
            }
            if (status != null) {
                statement.setString(index, status.name());
            }
            try (ResultSet rs = statement.executeQuery()) {
                List<OrderSession> sessions = new ArrayList<>();
                while (rs.next()) {
                    sessions.add(map(rs));
                }
                return sessions;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list order sessions", ex);
        }
    }

    private OrderSession map(ResultSet rs) throws SQLException {
        return OrderSession.restore(
                (UUID) rs.getObject("order_session_id"),
                (UUID) rs.getObject("table_id"),
                OrderSessionStatus.valueOf(rs.getString("status")),
                new TimeRange(SqlMapperSupport.instant(rs, "start_time"), SqlMapperSupport.instant(rs, "end_time"))
        );
    }
}
