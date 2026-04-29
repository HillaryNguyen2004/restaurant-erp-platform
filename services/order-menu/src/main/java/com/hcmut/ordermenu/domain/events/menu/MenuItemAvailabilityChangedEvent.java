package com.hcmut.ordermenu.domain.events.menu;

import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class MenuItemAvailabilityChangedEvent extends DomainEvent {
    private final boolean available;
    private final String reason;

    public MenuItemAvailabilityChangedEvent(UUID menuItemId, boolean available, String reason) {
        super(menuItemId);
        this.available = available;
        this.reason = reason;
    }

    @Override
    public String getEventType() {
        return available ? "menu.item.available" : "menu.item.unavailable";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("menuItemId", getAggregateId().toString());
        payload.put("available", available);
        payload.put("reason", reason);
        return payload;
    }
}