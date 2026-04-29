package com.hcmut.ordermenu.domain.repository;

import com.hcmut.ordermenu.domain.entity.Promotion;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public interface IPromotionRepository {
    Promotion save(Promotion promotion);

    Promotion findById(UUID promotionId);

    List<Promotion> findActive(Instant now);

    List<Promotion> findByApplicableItem(UUID itemId);

    void delete(UUID promotionId);
}
