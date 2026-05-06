package com.hcmut.ordermenu.dto;

import java.util.List;

public record PlaceOrderRequest(List<OrderItemRequest> items) {
}
