package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.MenuItem;
import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.menu.MenuItemAvailabilityChangedEvent;
import com.hcmut.ordermenu.domain.events.menu.MenuItemCreatedEvent;
import com.hcmut.ordermenu.adapter.websocket.WebSocketNotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("MenuEventPublisher Tests")
class MenuEventPublisherTest {

    @Mock
    private DomainEventPublisher domainEventPublisher;

    @Mock
    private WebSocketNotificationService webSocketNotificationService;

    private MenuEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new MenuEventPublisher(domainEventPublisher, webSocketNotificationService);
    }

    @Test
    @DisplayName("Should publish MenuItemCreatedEvent when creating menu item")
    void publishMenuItemCreated() {
        MenuItem item = new MenuItem(UUID.randomUUID(), "Pho", "Beef noodle soup", BigDecimal.valueOf(3.5), true);

        publisher.publishMenuItemCreated(item);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(MenuItemCreatedEvent.class, event);
        assertEquals("menu.item.created", event.getEventType());
        assertEquals(item.getMenuItemId(), event.getAggregateId());
    }

    @Test
    @DisplayName("Should publish unavailable event with reason")
    void publishMenuItemUnavailable() {
        UUID itemId = UUID.randomUUID();

        publisher.publishMenuItemUnavailable(itemId, "out of stock");

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(MenuItemAvailabilityChangedEvent.class, event);
        assertEquals("menu.item.unavailable", event.getEventType());
        assertEquals("out of stock", event.toPayload().get("reason"));
        verify(webSocketNotificationService).notifyMenuEvent(event);
    }
}
