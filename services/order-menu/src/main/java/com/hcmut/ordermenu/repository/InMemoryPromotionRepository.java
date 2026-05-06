package com.hcmut.ordermenu.repository;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class InMemoryPromotionRepository implements IPromotionRepository {
    private final Map<UUID, Promotion> promotionMap = new ConcurrentHashMap<>();

    @Override
    public Promotion save(Promotion promotion) {
        promotionMap.put(promotion.getId(), promotion);
        return promotion;
    }

    @Override
    public Promotion findById(UUID promotionId) {
        return promotionMap.get(promotionId);
    }

    @Override
    public List<Promotion> findActive(Instant now) {
        List<Promotion> matches = new ArrayList<>();
        for (Promotion promotion : promotionMap.values()) {
            if (promotion.isValidAt(now)) {
                matches.add(promotion);
            }
        }
        return matches;
    }

    @Override
    public List<Promotion> findByApplicableItem(UUID itemId) {
        List<Promotion> matches = new ArrayList<>();
        for (Promotion promotion : promotionMap.values()) {
            if (promotion.isApplicableToItem(itemId)) {
                matches.add(promotion);
            }
        }
        return matches;
    }

    @Override
    public void delete(UUID promotionId) {
        promotionMap.remove(promotionId);
    }
}
