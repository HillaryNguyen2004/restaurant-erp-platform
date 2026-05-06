package com.hcmut.ordermenu.service.promotion;

import com.hcmut.ordermenu.domain.repository.IPromotionRepository;
import com.hcmut.ordermenu.publisher.PromotionEventPublisher;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PromotionDeleter {
    private final IPromotionRepository promotionRepository;
    private final PromotionEventPublisher eventPublisher;

    public void delete(UUID promoId) {
        promotionRepository.delete(promoId);
        eventPublisher.publishPromotionDeleted(promoId);
    }
}
