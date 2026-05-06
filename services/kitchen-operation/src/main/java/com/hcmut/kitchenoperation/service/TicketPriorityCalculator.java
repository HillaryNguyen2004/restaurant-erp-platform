package com.hcmut.kitchenoperation.service;

import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.port.IClock;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketPriorityCalculator {
    private final IClock clock;

    public int calculatePriority(KitchenTicket ticket) {
        Instant now = clock.now();
        double urgencyScore = calculateUrgencyScore(ticket, now);
        double progress = getPreparationProgress(ticket, now);
        double allergyBoost = ticket.hasAllergyAlert() ? 15 : 0;

        return (int) Math.max(0, Math.min(100, Math.round(urgencyScore + (progress * 0.2) + allergyBoost)));
    }

    public List<KitchenTicket> sortByPriority(List<KitchenTicket> tickets) {
        return tickets.stream()
                .sorted(Comparator.comparingInt(KitchenTicket::getPriority).reversed())
                .toList();
    }

    private double calculateUrgencyScore(KitchenTicket ticket, Instant currentTime) {
        long remaining = ticket.calculateRemainingMinutes(currentTime);
        if (remaining <= 0) {
            return 100;
        }
        if (remaining <= 5) {
            return 85;
        }
        if (remaining <= 10) {
            return 70;
        }
        return Math.max(20, 60 - remaining);
    }

    private double getPreparationProgress(KitchenTicket ticket, Instant currentTime) {
        long elapsed = ticket.calculateElapsedMinutes(currentTime);
        if (ticket.getPrepTimeMinutes() <= 0) {
            return 100;
        }
        return Math.min(100, (elapsed * 100.0) / ticket.getPrepTimeMinutes());
    }
}
