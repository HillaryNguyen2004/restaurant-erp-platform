package com.hcmut.ordermenu.dto;

import com.hcmut.ordermenu.domain.enums.OrderStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderDto(
        UUID orderId,
        UUID sessionId,
        OrderStatus status,
        Instant placedAt,
        List<OrderItemDto> items,
        BigDecimal subtotal
) {
}
