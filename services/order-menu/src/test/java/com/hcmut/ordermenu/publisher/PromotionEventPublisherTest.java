package com.hcmut.ordermenu.publisher;

import com.hcmut.ordermenu.domain.entity.Promotion;
import com.hcmut.ordermenu.domain.enums.DiscountType;
import com.hcmut.ordermenu.domain.events.DomainEvent;
import com.hcmut.ordermenu.domain.events.DomainEventPublisher;
import com.hcmut.ordermenu.domain.events.promotion.PromotionCreatedEvent;
import com.hcmut.ordermenu.domain.events.promotion.PromotionDeletedEvent;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertInstanceOf;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
@DisplayName("PromotionEventPublisher Tests")
class PromotionEventPublisherTest {

    @Mock
    private DomainEventPublisher domainEventPublisher;

    private PromotionEventPublisher publisher;

    @BeforeEach
    void setUp() {
        publisher = new PromotionEventPublisher(domainEventPublisher);
    }

    @Test
    @DisplayName("Should publish PromotionCreatedEvent on create")
    void publishPromotionCreated() {
        Promotion promotion = new Promotion(
                "Lunch discount",
                DiscountType.PERCENTAGE,
                BigDecimal.valueOf(10),
                Instant.now(),
                Instant.now().plusSeconds(3600),
                List.of(UUID.randomUUID()),
                true
        );

        publisher.publishPromotionCreated(promotion);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(PromotionCreatedEvent.class, event);
        assertEquals("promotion.created", event.getEventType());
        assertEquals(promotion.getId(), event.getAggregateId());
    }

    @Test
    @DisplayName("Should publish PromotionDeletedEvent on delete")
    void publishPromotionDeleted() {
        UUID promotionId = UUID.randomUUID();

        publisher.publishPromotionDeleted(promotionId);

        ArgumentCaptor<DomainEvent> captor = ArgumentCaptor.forClass(DomainEvent.class);
        verify(domainEventPublisher).publish(captor.capture());

        DomainEvent event = captor.getValue();
        assertInstanceOf(PromotionDeletedEvent.class, event);
        assertEquals("promotion.deleted", event.getEventType());
        assertEquals(promotionId, event.getAggregateId());
    }
}