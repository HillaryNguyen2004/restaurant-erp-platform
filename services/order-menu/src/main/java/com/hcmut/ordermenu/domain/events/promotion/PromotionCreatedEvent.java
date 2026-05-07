package com.hcmut.ordermenu.domain.events.promotion;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public class PromotionCreatedEvent extends DomainEvent {
    private final String name;
    private final String discountType;
    private final BigDecimal discountValue;
    private final Instant validFrom;
    private final Instant validTo;
    private final List<String> applicableItems;
    private final boolean active;

    public PromotionCreatedEvent(Promotion promotion) {
        super(promotion.getId());
        this.name = promotion.getName();
        this.discountType = promotion.getDiscountType() == null ? null : promotion.getDiscountType().name();
        this.discountValue = promotion.getDiscountValue();
        this.validFrom = promotion.getValidFrom();
        this.validTo = promotion.getValidTo();
        this.applicableItems = promotion.getApplicableItems().stream().map(UUID::toString).toList();
        this.active = promotion.isActive();
    }

    @Override
    public String getEventType() {
        return "promotion.created";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("promotionId", getAggregateId().toString());
        payload.put("name", name);
        payload.put("discountType", discountType);
        payload.put("discountValue", discountValue);
        payload.put("validFrom", validFrom == null ? null : validFrom.toString());
        payload.put("validTo", validTo == null ? null : validTo.toString());
        payload.put("applicableItems", applicableItems);
        payload.put("active", active);
        return payload;
    }
}