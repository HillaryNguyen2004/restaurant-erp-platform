package com.hcmut.ordermenu.facade;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.dto.CreatePromotionRequest;
import com.hcmut.ordermenu.dto.PromotionDto;
import com.hcmut.ordermenu.dto.UpdatePromotionRequest;
import com.hcmut.ordermenu.service.promotion.PromotionCreator;
import com.hcmut.ordermenu.service.promotion.PromotionDeleter;
import com.hcmut.ordermenu.service.promotion.PromotionRetriever;
import com.hcmut.ordermenu.service.promotion.PromotionUpdater;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionFacade {
    private final PromotionCreator promotionCreator;
    private final PromotionUpdater promotionUpdater;
    private final PromotionRetriever promotionRetriever;
    private final PromotionDeleter promotionDeleter;

    public PromotionDto createPromotion(CreatePromotionRequest request) {
        return toDto(promotionCreator.create(request));
    }

    public PromotionDto updatePromotion(UUID promoId, UpdatePromotionRequest request) {
        return toDto(promotionUpdater.update(promoId, request));
    }

    public List<PromotionDto> getActivePromotions() {
        return promotionRetriever.getActive().stream().map(this::toDto).toList();
    }

    public void deletePromotion(UUID promoId) {
        promotionDeleter.delete(promoId);
    }

    private PromotionDto toDto(Promotion promotion) {
        return new PromotionDto(
                promotion.getId(),
                promotion.getName(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getValidFrom(),
                promotion.getValidTo(),
                promotion.getApplicableItems(),
                promotion.isActive()
        );
    }
}
