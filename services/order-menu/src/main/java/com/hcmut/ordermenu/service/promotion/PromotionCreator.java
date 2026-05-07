package com.hcmut.ordermenu.service.promotion;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import com.hcmut.ordermenu.dto.CreatePromotionRequest;
import com.hcmut.ordermenu.publisher.PromotionEventPublisher;
import com.hcmut.ordermenu.validator.PromotionValidator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PromotionCreator {
    private final IPromotionRepository promotionRepository;
    private final PromotionValidator promotionValidator;
    private final PromotionEventPublisher eventPublisher;

    public Promotion create(CreatePromotionRequest request) {
        promotionValidator.validateCreateRequest(request);

        Promotion promotion = new Promotion(
                request.name(),
                request.discountType(),
                request.discountValue(),
                request.validFrom(),
                request.validTo(),
                request.applicableItems(),
                request.active()
        );

        Promotion saved = promotionRepository.save(promotion);
        eventPublisher.publishPromotionCreated(saved);
        return saved;
    }
}
