package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketDetailResponseDto {
    private String ticketId;
    private String orderId;
    private String tableNumber;
    private String stationId;
    private String stationName;
    private String status;
    private List<TicketItemDto> items;
    private String courseType;
    private int priority;
    private long elapsedMinutes;
    private long remainingMinutes;
    private String alertLevel;
    private String colorCode;
    private boolean hasAllergyAlert;
    private String specialInstructions;
    private Instant createdAt;
}
