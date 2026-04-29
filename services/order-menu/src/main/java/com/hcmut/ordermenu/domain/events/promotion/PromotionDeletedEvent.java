package com.hcmut.ordermenu.domain.events.promotion;

import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class PromotionDeletedEvent extends DomainEvent {
    public PromotionDeletedEvent(UUID promotionId) {
        super(promotionId);
    }

    @Override
    public String getEventType() {
        return "promotion.deleted";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("promotionId", getAggregateId().toString());
        return payload;
    }
}