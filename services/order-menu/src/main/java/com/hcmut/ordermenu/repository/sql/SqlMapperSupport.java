package com.hcmut.ordermenu.repository.sql;

import java.sql.Array;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

final class SqlMapperSupport {
    private SqlMapperSupport() {
    }

    static Timestamp timestamp(Instant instant) {
        return instant == null ? null : Timestamp.from(instant);
    }

    static Instant instant(ResultSet rs, String column) throws SQLException {
        Timestamp value = rs.getTimestamp(column);
        return value == null ? null : value.toInstant();
    }

    static Array textArray(Connection connection, List<String> values) throws SQLException {
        return connection.createArrayOf("text", (values == null ? List.<String>of() : values).toArray(String[]::new));
    }

    static List<String> stringList(ResultSet rs, String column) throws SQLException {
        Array array = rs.getArray(column);
        if (array == null) {
            return List.of();
        }
        Object[] values = (Object[]) array.getArray();
        List<String> result = new ArrayList<>();
        for (Object value : values) {
            result.add(String.valueOf(value));
        }
        return result;
    }

    static List<UUID> uuidList(ResultSet rs, String column) throws SQLException {
        Array array = rs.getArray(column);
        if (array == null) {
            return List.of();
        }
        Object[] values = (Object[]) array.getArray();
        List<UUID> result = new ArrayList<>();
        for (Object value : values) {
            result.add(UUID.fromString(String.valueOf(value)));
        }
        return result;
    }
}
