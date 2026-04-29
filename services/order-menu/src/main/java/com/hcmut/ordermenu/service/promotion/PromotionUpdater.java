package com.hcmut.ordermenu.service.promotion;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import com.hcmut.ordermenu.dto.UpdatePromotionRequest;
import com.hcmut.ordermenu.publisher.PromotionEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionUpdater {
    private final IPromotionRepository promotionRepository;
    private final PromotionEventPublisher eventPublisher;

    public Promotion update(UUID promotionId, UpdatePromotionRequest request) {
        Promotion promotion = promotionRepository.findById(promotionId);
        if (promotion == null) {
            throw new IllegalArgumentException("Promotion not found: " + promotionId);
        }

        promotion.update(
                request.name(),
                request.discountValue(),
                request.validFrom(),
                request.validTo(),
                request.applicableItems(),
                request.active()
        );

        Promotion saved = promotionRepository.save(promotion);
        eventPublisher.publishPromotionUpdated(saved);
        return saved;
    }
}
