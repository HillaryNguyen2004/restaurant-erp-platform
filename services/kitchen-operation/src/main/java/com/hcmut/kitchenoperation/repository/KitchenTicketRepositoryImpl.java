package com.hcmut.kitchenoperation.repository;

import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.repository.IKitchenTicketRepository;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Repository
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "memory", matchIfMissing = true)
public class KitchenTicketRepositoryImpl implements IKitchenTicketRepository {
    private final Map<String, Map<String, Object>> database = new ConcurrentHashMap<>();

    @Override
    public KitchenTicket findById(String ticketId) {
        Map<String, Object> row = database.get(ticketId);
        return row == null ? null : mapToEntity(row);
    }

    @Override
    public List<KitchenTicket> findByStationId(String stationId) {
        List<KitchenTicket> matches = new ArrayList<>();
        for (Map<String, Object> row : database.values()) {
            KitchenTicket ticket = mapToEntity(row);
            if (stationId.equals(ticket.getStationId())) {
                matches.add(ticket);
            }
        }
        return matches;
    }

    @Override
    public List<KitchenTicket> findActiveByStationId(String stationId) {
        return findByStationId(stationId).stream().filter(KitchenTicket::isActive).toList();
    }

    @Override
    public List<KitchenTicket> findByOrderId(String orderId) {
        List<KitchenTicket> matches = new ArrayList<>();
        for (Map<String, Object> row : database.values()) {
            KitchenTicket ticket = mapToEntity(row);
            if (orderId.equals(ticket.getOrderId())) {
                matches.add(ticket);
            }
        }
        return matches;
    }

    @Override
    public List<KitchenTicket> findByCourseType(String orderId, String courseType) {
        List<KitchenTicket> matches = new ArrayList<>();
        for (Map<String, Object> row : database.values()) {
            KitchenTicket ticket = mapToEntity(row);
            if (orderId.equals(ticket.getOrderId()) && courseType.equalsIgnoreCase(ticket.getCourseType())) {
                matches.add(ticket);
            }
        }
        return matches;
    }

    @Override
    public KitchenTicket save(KitchenTicket ticket) {
        database.put(ticket.getId(), mapToRow(ticket));
        return ticket;
    }

    @Override
    public void saveAll(List<KitchenTicket> tickets) {
        for (KitchenTicket ticket : tickets) {
            save(ticket);
        }
    }

    @Override
    public KitchenTicket update(KitchenTicket ticket) {
        database.put(ticket.getId(), mapToRow(ticket));
        return ticket;
    }

    @Override
    public void delete(String ticketId) {
        database.remove(ticketId);
    }

    private KitchenTicket mapToEntity(Map<String, Object> row) {
        return (KitchenTicket) row.get("ticket");
    }

    private Map<String, Object> mapToRow(KitchenTicket ticket) {
        Map<String, Object> row = new ConcurrentHashMap<>();
        row.put("ticket", ticket);
        return row;
    }
}
