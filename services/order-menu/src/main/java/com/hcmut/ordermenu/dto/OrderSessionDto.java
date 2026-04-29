package com.hcmut.ordermenu.dto;

import com.hcmut.ordermenu.domain.enums.OrderSessionStatus;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record OrderSessionDto(
        UUID sessionId,
        UUID tableId,
        OrderSessionStatus status,
        Instant openedAt,
        Instant closedAt,
        List<OrderDto> orders,
        BigDecimal subtotal
) {
}
