package com.hcmut.ordermenu.domain.events.menu;

import com.hcmut.ordermenu.domain.events.DomainEvent;

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.UUID;

public class MenuItemDeletedEvent extends DomainEvent {
    public MenuItemDeletedEvent(UUID menuItemId) {
        super(menuItemId);
    }

    @Override
    public String getEventType() {
        return "menu.item.deleted";
    }

    @Override
    public Map<String, Object> toPayload() {
        Map<String, Object> payload = new LinkedHashMap<>();
        payload.put("menuItemId", getAggregateId().toString());
        return payload;
    }
}