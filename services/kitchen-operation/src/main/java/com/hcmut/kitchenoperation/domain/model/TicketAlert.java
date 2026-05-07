package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.time.Instant;

@Getter
public class TicketAlert {
    private final String ticketId;
    private final String stationId;
    private final String alertLevel;
    private final long elapsedMinutes;
    private final long remainingMinutes;
    private final double progressPercent;
    private final String colorCode;
    private final String message;
    private final Instant timestamp;

    public TicketAlert(
            String ticketId,
            String stationId,
            String alertLevel,
            long elapsedMinutes,
            long remainingMinutes,
            double progressPercent,
            String colorCode,
            String message,
            Instant timestamp
    ) {
        this.ticketId = ticketId;
        this.stationId = stationId;
        this.alertLevel = alertLevel;
        this.elapsedMinutes = elapsedMinutes;
        this.remainingMinutes = remainingMinutes;
        this.progressPercent = progressPercent;
        this.colorCode = colorCode;
        this.message = message;
        this.timestamp = timestamp;
    }
}
