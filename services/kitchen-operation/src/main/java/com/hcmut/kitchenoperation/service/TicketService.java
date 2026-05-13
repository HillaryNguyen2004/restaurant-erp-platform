package com.hcmut.kitchenoperation.service;

import com.hcmut.kitchenoperation.domain.events.TicketAlertTriggeredEvent;
import com.hcmut.kitchenoperation.domain.events.TicketStatusChangedEvent;
import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.TicketAlert;
import com.hcmut.kitchenoperation.domain.repository.IKitchenTicketRepository;
import com.hcmut.kitchenoperation.port.IClock;
import com.hcmut.kitchenoperation.port.IEventPublisher;
import com.hcmut.kitchenoperation.port.INotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
@Slf4j
public class TicketService {
    private final IKitchenTicketRepository ticketRepository;
    private final TicketPriorityCalculator priorityCalculator;
    private final TicketAlertEvaluator alertEvaluator;
    private final IEventPublisher eventPublisher;
    private final INotificationService notificationService;
    private final IClock clock;

    public List<KitchenTicket> getTicketsByStation(String stationId, String sortBy) {
        List<KitchenTicket> tickets = new ArrayList<>(ticketRepository.findByStationId(stationId));
        for (KitchenTicket ticket : tickets) {
            ticket.setPriority(priorityCalculator.calculatePriority(ticket));
            ticketRepository.update(ticket);
        }
        return sortTickets(tickets, sortBy);
    }

    public KitchenTicket getTicketById(String ticketId) {
        KitchenTicket ticket = ticketRepository.findById(ticketId);
        if (ticket == null) {
            throw new IllegalArgumentException("Kitchen ticket not found: " + ticketId);
        }
        return ticket;
    }

    public KitchenTicket updateTicketStatus(String ticketId, String newStatus, String userId) {
        KitchenTicket ticket = getTicketById(ticketId);
        String oldStatus = ticket.getStatus();

        ticket.changeStatus(newStatus.toUpperCase(Locale.ROOT), clock.now());
        ticket.setPriority(priorityCalculator.calculatePriority(ticket));
        KitchenTicket updated = ticketRepository.update(ticket);

        TicketStatusChangedEvent event = new TicketStatusChangedEvent(
                updated.getId(),
                updated.getOrderId(),
                updated.getStationId(),
                oldStatus,
                updated.getStatus(),
                userId
        );
        eventPublisher.publish(event);
        notificationService.notifyStation(updated.getStationId(), event);

        CompletableFuture.runAsync(() -> {
            try {
                checkAndTriggerAlert(updated);
            } catch (RuntimeException ex) {
                log.warn("ticket-alert-evaluation-failed ticketId={}", updated.getId(), ex);
            }
        });
        return updated;
    }

    public void recalculatePriorities(String stationId) {
        List<KitchenTicket> tickets = ticketRepository.findActiveByStationId(stationId);
        for (KitchenTicket ticket : tickets) {
            ticket.setPriority(priorityCalculator.calculatePriority(ticket));
            ticketRepository.update(ticket);
        }
    }

    public List<TicketAlert> evaluateAlerts(String stationId) {
        Instant now = clock.now();
        return ticketRepository.findActiveByStationId(stationId).stream()
                .map(ticket -> alertEvaluator.evaluateTicket(ticket, now))
                .toList();
    }

    private List<KitchenTicket> sortTickets(List<KitchenTicket> tickets, String sortBy) {
        String normalized = sortBy == null ? "priority" : sortBy.toLowerCase(Locale.ROOT);
        Comparator<KitchenTicket> comparator;

        switch (normalized) {
            case "createdat" -> comparator = Comparator.comparing(KitchenTicket::getCreatedAt);
            case "remainingtime" -> comparator = Comparator.comparingLong(ticket -> ticket.calculateRemainingMinutes(clock.now()));
            default -> comparator = Comparator.comparingInt(KitchenTicket::getPriority).reversed();
        }

        return tickets.stream().sorted(comparator).toList();
    }

    private void checkAndTriggerAlert(KitchenTicket ticket) {
        Instant now = clock.now();
        if (!alertEvaluator.shouldNotify(ticket, now)) {
            return;
        }

        TicketAlert alert = alertEvaluator.evaluateTicket(ticket, now);
        TicketAlertTriggeredEvent event = new TicketAlertTriggeredEvent(alert);
        eventPublisher.publish(event);
        notificationService.notifyStation(ticket.getStationId(), event);
    }
}
