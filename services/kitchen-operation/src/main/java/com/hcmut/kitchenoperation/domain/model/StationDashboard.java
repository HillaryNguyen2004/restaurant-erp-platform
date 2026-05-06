package com.hcmut.kitchenoperation.domain.model;

import lombok.Getter;

import java.util.ArrayList;
import java.util.List;

@Getter
public class StationDashboard {
    private final String stationId;
    private final String stationName;
    private final List<KitchenTicket> activeTickets;
    private final long pendingCount;
    private final long inProgressCount;
    private final long completedCount;
    private final long overdueCount;
    private final double averageElapsedMinutes;

    public StationDashboard(
            String stationId,
            String stationName,
            List<KitchenTicket> activeTickets,
            DashboardMetrics metrics
    ) {
        this.stationId = stationId;
        this.stationName = stationName;
        this.activeTickets = new ArrayList<>(activeTickets == null ? List.of() : activeTickets);
        this.pendingCount = metrics.getPendingCount();
        this.inProgressCount = metrics.getInProgressCount();
        this.completedCount = metrics.getCompletedCount();
        this.overdueCount = metrics.getOverdueCount();
        this.averageElapsedMinutes = metrics.getAverageElapsedMinutes();
    }
}
