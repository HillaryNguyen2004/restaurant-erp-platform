package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.menu.MenuItemAvailabilityChangedEvent;
import com.hcmut.ordermenu.domain.events.menu.MenuItemCreatedEvent;
import com.hcmut.ordermenu.domain.events.menu.MenuItemDeletedEvent;
import com.hcmut.ordermenu.domain.events.menu.MenuItemUpdatedEvent;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@RequiredArgsConstructor
public class MenuEventPublisher {
    private final DomainEventPublisher domainEventPublisher;
    private final WebSocketNotificationService webSocketNotificationService;

    public void publishMenuItemCreated(MenuItem item) {
        domainEventPublisher.publish(new MenuItemCreatedEvent(item));
    }

    public void publishMenuItemUpdated(MenuItem item) {
        domainEventPublisher.publish(new MenuItemUpdatedEvent(item));
    }

    public void publishMenuItemDeleted(UUID itemId) {
        domainEventPublisher.publish(new MenuItemDeletedEvent(itemId));
    }

    public void publishMenuItemUnavailable(UUID itemId, String reason) {
        MenuItemAvailabilityChangedEvent event = new MenuItemAvailabilityChangedEvent(itemId, false, reason);
        domainEventPublisher.publish(event);
        webSocketNotificationService.notifyMenuEvent(event);
    }

    public void publishMenuItemAvailable(UUID itemId) {
        MenuItemAvailabilityChangedEvent event = new MenuItemAvailabilityChangedEvent(itemId, true, null);
        domainEventPublisher.publish(event);
        webSocketNotificationService.notifyMenuEvent(event);
    }
}
