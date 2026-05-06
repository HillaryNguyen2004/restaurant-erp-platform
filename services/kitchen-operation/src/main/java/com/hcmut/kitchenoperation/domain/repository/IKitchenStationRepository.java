package com.hcmut.kitchenoperation.domain.repository;

import com.hcmut.kitchenoperation.domain.model.KitchenStation;

import java.util.List;

public interface IKitchenStationRepository {
    KitchenStation findById(String stationId);

    KitchenStation findByDishType(String dishType);

    List<KitchenStation> findAll();

    List<KitchenStation> findAllActive();

    KitchenStation save(KitchenStation station);

    KitchenStation update(KitchenStation station);

    void delete(String stationId);
}
