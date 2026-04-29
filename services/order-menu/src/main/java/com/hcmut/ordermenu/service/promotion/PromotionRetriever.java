package com.hcmut.ordermenu.service.promotion;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionRetriever {
    private final IPromotionRepository promotionRepository;

    public List<Promotion> getActive() {
        return promotionRepository.findActive(Instant.now());
    }

    public Promotion getById(UUID promoId) {
        Promotion promotion = promotionRepository.findById(promoId);
        if (promotion == null) {
            throw new IllegalArgumentException("Promotion not found: " + promoId);
        }
        return promotion;
    }

    public List<Promotion> getApplicableToItem(UUID itemId) {
        return promotionRepository.findByApplicableItem(itemId);
    }
}
