package com.hcmut.kitchenoperation.service;

import com.hcmut.kitchenoperation.domain.events.DomainEvent;
import com.hcmut.kitchenoperation.domain.events.TicketCreatedEvent;
import com.hcmut.kitchenoperation.domain.model.DashboardMetrics;
import com.hcmut.kitchenoperation.domain.model.KitchenStation;
import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.Order;
import com.hcmut.kitchenoperation.domain.model.OrderItem;
import com.hcmut.kitchenoperation.domain.model.StationDashboard;
import com.hcmut.kitchenoperation.domain.model.TicketItem;
import com.hcmut.kitchenoperation.domain.repository.IKitchenStationRepository;
import com.hcmut.kitchenoperation.domain.repository.IKitchenTicketRepository;
import com.hcmut.kitchenoperation.port.IClock;
import com.hcmut.kitchenoperation.port.IEventPublisher;
import com.hcmut.kitchenoperation.port.IOrderReader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class KitchenService {
    private final IKitchenTicketRepository ticketRepository;
    private final IKitchenStationRepository stationRepository;
    private final IOrderReader orderReader;
    private final IEventPublisher eventPublisher;
    private final IClock clock;

    public List<KitchenTicket> routeOrderToKitchen(String orderId) {
        List<KitchenTicket> existing = ticketRepository.findByOrderId(orderId);
        if (!existing.isEmpty()) {
            return existing;
        }

        Order order = orderReader.getOrder(orderId);
        List<OrderItem> items = orderReader.getOrderItems(orderId);
        return routeItemsToKitchen(order, items);
    }

    public List<KitchenTicket> routeItemsToKitchen(Order order, List<OrderItem> items) {
        Map<String, List<OrderItem>> stationItemMap = groupItemsByStation(items);
        List<KitchenTicket> tickets = new ArrayList<>();

        for (Map.Entry<String, List<OrderItem>> entry : stationItemMap.entrySet()) {
            KitchenStation station = stationRepository.findById(entry.getKey());
            if (station == null) {
                continue;
            }

            KitchenTicket ticket = createTicketsForStation(order, entry.getValue(), station);
            tickets.add(ticket);
        }

        ticketRepository.saveAll(tickets);

        List<DomainEvent> events = new ArrayList<>();
        for (KitchenTicket ticket : tickets) {
            events.add(new TicketCreatedEvent(ticket));
        }
        eventPublisher.publishBatch(events);

        return tickets;
    }

    public StationDashboard getStationDashboard(String stationId) {
        KitchenStation station = stationRepository.findById(stationId);
        if (station == null) {
            throw new IllegalArgumentException("Kitchen station not found: " + stationId);
        }

        List<KitchenTicket> activeTickets = ticketRepository.findActiveByStationId(stationId);
        DashboardMetrics metrics = calculateDashboardMetrics(activeTickets);
        return new StationDashboard(stationId, station.getName(), activeTickets, metrics);
    }

    private Map<String, List<OrderItem>> groupItemsByStation(List<OrderItem> items) {
        Map<String, List<OrderItem>> grouped = new LinkedHashMap<>();
        for (OrderItem item : items) {
            KitchenStation station = stationRepository.findByDishType(item.getDishType());
            if (station == null) {
                continue;
            }

            grouped.computeIfAbsent(station.getId(), ignored -> new ArrayList<>()).add(item);
        }
        return grouped;
    }

    private KitchenTicket createTicketsForStation(Order order, List<OrderItem> items, KitchenStation station) {
        List<TicketItem> ticketItems = items.stream()
                .map(item -> new TicketItem(
                        item.getOrderItemId(),
                        item.getMenuItemName(),
                        item.getDishType(),
                        item.getQuantity(),
                        item.getSpecialInstructions(),
                        item.getAllergyTags(),
                        item.getPrepTimeMinutes()
                ))
                .toList();

        int prepTimeMinutes = ticketItems.stream()
                .mapToInt(TicketItem::getPrepTimeMinutes)
                .max()
                .orElse(5);

        String courseType = items.stream()
                .map(OrderItem::getCourseType)
                .distinct()
                .count() == 1
                ? items.getFirst().getCourseType()
                : "MIXED";

        return new KitchenTicket(
                order.getOrderId(),
                order.getTableNumber(),
                station.getId(),
                ticketItems,
                courseType,
                prepTimeMinutes,
                order.getSpecialInstructions()
        );
    }

    private DashboardMetrics calculateDashboardMetrics(List<KitchenTicket> tickets) {
        long pendingCount = tickets.stream().filter(ticket -> KitchenTicket.STATUS_PENDING.equals(ticket.getStatus())).count();
        long inProgressCount = tickets.stream().filter(ticket -> KitchenTicket.STATUS_IN_PROGRESS.equals(ticket.getStatus())).count();
        long completedCount = tickets.stream().filter(ticket -> KitchenTicket.STATUS_COMPLETED.equals(ticket.getStatus())).count();
        long overdueCount = tickets.stream().filter(ticket -> ticket.isOverdue(clock.now())).count();
        double averageElapsedMinutes = tickets.stream()
                .mapToLong(ticket -> ticket.calculateElapsedMinutes(clock.now()))
                .average()
                .orElse(0);
        long totalActiveCount = tickets.stream().filter(KitchenTicket::isActive).count();

        return new DashboardMetrics(
                pendingCount,
                inProgressCount,
                completedCount,
                overdueCount,
                averageElapsedMinutes,
                totalActiveCount
        );
    }
}
