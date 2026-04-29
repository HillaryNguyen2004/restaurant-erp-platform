package com.hcmut.kitchenoperation.repository.sql;

import com.hcmut.kitchenoperation.config.SqlConnectionFactory;
import com.hcmut.kitchenoperation.domain.model.KitchenStation;
import com.hcmut.kitchenoperation.domain.repository.IKitchenStationRepository;
import jakarta.annotation.PostConstruct;
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
public class SqlKitchenStationRepository implements IKitchenStationRepository {
    private final SqlConnectionFactory connectionFactory;

    public SqlKitchenStationRepository(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
    }

    @PostConstruct
    void seedStations() {
        if (!findAll().isEmpty()) {
            return;
        }
        save(new KitchenStation("STATION-GRILL", "Grill", "HOT", List.of("steak", "burger", "grill", "bbq", "main"), true));
        save(new KitchenStation("STATION-SALAD", "Salad", "COLD", List.of("salad", "appetizer", "cold"), true));
        save(new KitchenStation("STATION-DESSERT", "Dessert", "PASTRY", List.of("dessert", "cake", "ice-cream", "sweet"), true));
        save(new KitchenStation("STATION-EXPEDITE", "Expedite", "GENERAL", List.of("other", "default", "main", "appetizer", "dessert"), true));
    }

    @Override
    public KitchenStation findById(String stationId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("SELECT * FROM kitchen_stations WHERE station_id = ?")) {
            statement.setString(1, stationId);
            try (ResultSet rs = statement.executeQuery()) {
                return rs.next() ? map(rs) : null;
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find kitchen station", ex);
        }
    }

    @Override
    public KitchenStation findByDishType(String dishType) {
        String key = dishType == null || dishType.isBlank() ? "default" : dishType;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("""
                     SELECT * FROM kitchen_stations
                     WHERE active = true AND ? = ANY(supported_dish_types)
                     ORDER BY station_id
                     LIMIT 1
                     """)) {
            statement.setString(1, key.toLowerCase());
            try (ResultSet rs = statement.executeQuery()) {
                if (rs.next()) {
                    return map(rs);
                }
            }
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to find station by dish type", ex);
        }
        return findById("STATION-EXPEDITE");
    }

    @Override
    public List<KitchenStation> findAll() {
        return findMany("SELECT * FROM kitchen_stations ORDER BY station_id");
    }

    @Override
    public List<KitchenStation> findAllActive() {
        return findMany("SELECT * FROM kitchen_stations WHERE active = true ORDER BY station_id");
    }

    @Override
    public KitchenStation save(KitchenStation station) {
        String sql = """
                INSERT INTO kitchen_stations (station_id, name, station_type, supported_dish_types, active)
                VALUES (?, ?, ?, ?, ?)
                ON CONFLICT (station_id) DO UPDATE SET
                    name = EXCLUDED.name,
                    station_type = EXCLUDED.station_type,
                    supported_dish_types = EXCLUDED.supported_dish_types,
                    active = EXCLUDED.active
                """;
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql)) {
            statement.setString(1, station.getId());
            statement.setString(2, station.getName());
            statement.setString(3, station.getStationType());
            statement.setArray(4, SqlMapperSupport.textArray(connection, station.getSupportedDishTypes().stream().map(String::toLowerCase).toList()));
            statement.setBoolean(5, station.isActive());
            statement.executeUpdate();
            return station;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to save kitchen station", ex);
        }
    }

    @Override
    public KitchenStation update(KitchenStation station) {
        return save(station);
    }

    @Override
    public void delete(String stationId) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement("DELETE FROM kitchen_stations WHERE station_id = ?")) {
            statement.setString(1, stationId);
            statement.executeUpdate();
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to delete kitchen station", ex);
        }
    }

    private List<KitchenStation> findMany(String sql) {
        try (Connection connection = connectionFactory.getConnection();
             var statement = connection.prepareStatement(sql);
             ResultSet rs = statement.executeQuery()) {
            List<KitchenStation> stations = new ArrayList<>();
            while (rs.next()) {
                stations.add(map(rs));
            }
            return stations;
        } catch (SQLException ex) {
            throw new IllegalStateException("Failed to list kitchen stations", ex);
        }
    }

    private KitchenStation map(ResultSet rs) throws SQLException {
        return new KitchenStation(
                rs.getString("station_id"),
                rs.getString("name"),
                rs.getString("station_type"),
                SqlMapperSupport.stringList(rs, "supported_dish_types"),
                rs.getBoolean("active")
        );
    }
}
