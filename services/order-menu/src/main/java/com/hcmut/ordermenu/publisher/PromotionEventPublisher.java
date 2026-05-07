package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.promotion.PromotionCreatedEvent;
import com.hcmut.ordermenu.domain.events.promotion.PromotionDeletedEvent;
import com.hcmut.ordermenu.domain.events.promotion.PromotionUpdatedEvent;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class PromotionEventPublisher {
    private final DomainEventPublisher domainEventPublisher;

    public void publishPromotionCreated(Promotion promotion) {
        domainEventPublisher.publish(new PromotionCreatedEvent(promotion));
    }

    public void publishPromotionUpdated(Promotion promotion) {
        domainEventPublisher.publish(new PromotionUpdatedEvent(promotion));
    }

    public void publishPromotionDeleted(UUID promotionId) {
        domainEventPublisher.publish(new PromotionDeletedEvent(promotionId));
    }
}
