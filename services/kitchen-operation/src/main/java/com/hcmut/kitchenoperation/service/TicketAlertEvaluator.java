package com.hcmut.kitchenoperation.service;

import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.TicketAlert;
import com.hcmut.kitchenoperation.port.IClock;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class TicketAlertEvaluator {
    private final IClock clock;
    private final double warningThreshold;
    private final double criticalThreshold;

    public TicketAlertEvaluator(
            IClock clock,
            @Value("${app.alert.warning-threshold:70}") double warningThreshold,
            @Value("${app.alert.critical-threshold:90}") double criticalThreshold
    ) {
        this.clock = clock;
        this.warningThreshold = warningThreshold;
        this.criticalThreshold = criticalThreshold;
    }

    public TicketAlert evaluateTicket(KitchenTicket ticket, Instant currentTime) {
        long elapsed = ticket.calculateElapsedMinutes(currentTime);
        long remaining = ticket.calculateRemainingMinutes(currentTime);
        double progress = ticket.getPrepTimeMinutes() <= 0
                ? 100
                : Math.min(100, (elapsed * 100.0) / ticket.getPrepTimeMinutes());
        String level = determineAlertLevel(progress);
        String color = getAlertColor(level);
        String message = "Ticket " + ticket.getId() + " is " + progress + "% through prep";

        return new TicketAlert(
                ticket.getId(),
                ticket.getStationId(),
                level,
                elapsed,
                remaining,
                progress,
                color,
                message,
                currentTime
        );
    }

    public boolean shouldNotify(KitchenTicket ticket, Instant currentTime) {
        if (!ticket.isActive()) {
            return false;
        }

        TicketAlert alert = evaluateTicket(ticket, currentTime);
        return "WARNING".equals(alert.getAlertLevel()) || "CRITICAL".equals(alert.getAlertLevel());
    }

    private String determineAlertLevel(double progressPercent) {
        if (progressPercent >= criticalThreshold) {
            return "CRITICAL";
        }
        if (progressPercent >= warningThreshold) {
            return "WARNING";
        }
        return "NORMAL";
    }

    private String getAlertColor(String level) {
        return switch (level) {
            case "CRITICAL" -> "#D62828";
            case "WARNING" -> "#F77F00";
            default -> "#2A9D8F";
        };
    }
}
