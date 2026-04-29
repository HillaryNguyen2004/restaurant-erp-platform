package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.time.Instant;

@Getter
public class Order {
    private final String orderId;
    private final String tableNumber;
    private final String orderStatus;
    private final String specialInstructions;
    private final Instant createdAt;

    public Order(String orderId, String tableNumber, String orderStatus, String specialInstructions, Instant createdAt) {
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.orderStatus = orderStatus;
        this.specialInstructions = specialInstructions;
        this.createdAt = createdAt;
    }
}
