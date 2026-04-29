package com.hcmut.ordermenu.domain.valueobject;

import lombok.Getter;

import java.time.Instant;

@Getter
public class TimeRange {
    private Instant startTime;
    private Instant endTime;

    public TimeRange(Instant startTime, Instant endTime) {
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public boolean isWithinRange(Instant time) {
        return !time.isBefore(startTime) && !time.isAfter(endTime);
    }

    public boolean overlapsWith(TimeRange other) {
        return this.startTime.isBefore(other.endTime) && this.endTime.isAfter(other.startTime);
    }
}
