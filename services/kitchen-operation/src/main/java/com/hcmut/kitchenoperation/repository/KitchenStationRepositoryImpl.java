package com.hcmut.kitchenoperation.repository;

import com.hcmut.kitchenoperation.domain.model.KitchenStation;
import com.hcmut.kitchenoperation.domain.repository.IKitchenStationRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class KitchenStationRepositoryImpl implements IKitchenStationRepository {
    private final Map<String, KitchenStation> database = new ConcurrentHashMap<>();
    private final Map<String, String> cache = new ConcurrentHashMap<>();

    @Override
    public KitchenStation findById(String stationId) {
        return database.get(stationId);
    }

    @Override
    public KitchenStation findByDishType(String dishType) {
        if (dishType == null || dishType.isBlank()) {
            return database.get("STATION-EXPEDITE");
        }

        String key = dishType.toLowerCase(Locale.ROOT);
        String stationId = cache.get(key);
        if (stationId != null) {
            return database.get(stationId);
        }

        for (KitchenStation station : database.values()) {
            if (station.canHandle(dishType)) {
                cache.put(key, station.getId());
                return station;
            }
        }

        return database.get("STATION-EXPEDITE");
    }

    @Override
    public List<KitchenStation> findAll() {
        return database.values().stream().toList();
    }

    @Override
    public List<KitchenStation> findAllActive() {
        return database.values().stream().filter(KitchenStation::isActive).toList();
    }

    @Override
    public KitchenStation save(KitchenStation station) {
        database.put(station.getId(), station);
        rebuildCache();
        return station;
    }

    @Override
    public KitchenStation update(KitchenStation station) {
        return save(station);
    }

    @Override
    public void delete(String stationId) {
        database.remove(stationId);
        rebuildCache();
    }

    private void rebuildCache() {
        cache.clear();
        for (KitchenStation station : database.values()) {
            if (!station.isActive()) {
                continue;
            }

            for (String dishType : station.getSupportedDishTypes()) {
                cache.put(dishType.toLowerCase(Locale.ROOT), station.getId());
            }
        }
    }
}
