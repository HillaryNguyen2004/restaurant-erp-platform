package com.hcmut.kitchenoperation.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardMetricsDto {
    private long pendingCount;
    private long inProgressCount;
    private long completedCount;
    private long overdueCount;
    private double averageElapsedMinutes;
}
