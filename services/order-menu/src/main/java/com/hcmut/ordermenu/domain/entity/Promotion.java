package com.hcmut.ordermenu.domain.entity;

import com.hcmut.ordermenu.domain.enums.DiscountType;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Getter
public class Promotion {
    private final UUID id;
    private String name;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private Instant validFrom;
    private Instant validTo;
    private List<UUID> applicableItems;
    private boolean active;

    public Promotion(
            String name,
            DiscountType discountType,
            BigDecimal discountValue,
            Instant validFrom,
            Instant validTo,
            List<UUID> applicableItems,
            boolean active
    ) {
        this.id = UUID.randomUUID();
        this.name = name;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.applicableItems = new ArrayList<>(applicableItems == null ? List.of() : applicableItems);
        this.active = active;
    }

    private Promotion(
            UUID id,
            String name,
            DiscountType discountType,
            BigDecimal discountValue,
            Instant validFrom,
            Instant validTo,
            List<UUID> applicableItems,
            boolean active
    ) {
        this.id = id;
        this.name = name;
        this.discountType = discountType;
        this.discountValue = discountValue;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.applicableItems = new ArrayList<>(applicableItems == null ? List.of() : applicableItems);
        this.active = active;
    }

    public static Promotion restore(
            UUID id,
            String name,
            DiscountType discountType,
            BigDecimal discountValue,
            Instant validFrom,
            Instant validTo,
            List<UUID> applicableItems,
            boolean active
    ) {
        return new Promotion(id, name, discountType, discountValue, validFrom, validTo, applicableItems, active);
    }

    public boolean isValidAt(Instant checkTime) {
        if (!active) {
            return false;
        }

        return (validFrom == null || !checkTime.isBefore(validFrom))
                && (validTo == null || !checkTime.isAfter(validTo));
    }

    public boolean isApplicableToItem(UUID itemId) {
        return applicableItems.isEmpty() || applicableItems.contains(itemId);
    }

    public void update(
            String name,
            BigDecimal discountValue,
            Instant validFrom,
            Instant validTo,
            List<UUID> applicableItems,
            boolean active
    ) {
        this.name = name;
        this.discountValue = discountValue;
        this.validFrom = validFrom;
        this.validTo = validTo;
        this.applicableItems = new ArrayList<>(applicableItems == null ? List.of() : applicableItems);
        this.active = active;
    }
}
