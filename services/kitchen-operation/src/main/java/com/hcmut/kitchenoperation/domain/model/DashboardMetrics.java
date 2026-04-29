package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

@Getter
public class DashboardMetrics {
    private final long pendingCount;
    private final long inProgressCount;
    private final long completedCount;
    private final long overdueCount;
    private final double averageElapsedMinutes;
    private final long totalActiveCount;

    public DashboardMetrics(
            long pendingCount,
            long inProgressCount,
            long completedCount,
            long overdueCount,
            double averageElapsedMinutes,
            long totalActiveCount
    ) {
        this.pendingCount = pendingCount;
        this.inProgressCount = inProgressCount;
        this.completedCount = completedCount;
        this.overdueCount = overdueCount;
        this.averageElapsedMinutes = averageElapsedMinutes;
        this.totalActiveCount = totalActiveCount;
    }
}
