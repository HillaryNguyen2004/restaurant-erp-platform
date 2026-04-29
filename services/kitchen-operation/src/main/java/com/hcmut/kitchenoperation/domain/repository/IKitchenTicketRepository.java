package com.hcmut.kitchenoperation.domain.repository;

import com.hcmut.kitchenoperation.domain.model.KitchenTicket;

import java.util.List;

public interface IKitchenTicketRepository {
    KitchenTicket findById(String ticketId);

    List<KitchenTicket> findByStationId(String stationId);

    List<KitchenTicket> findActiveByStationId(String stationId);

    List<KitchenTicket> findByOrderId(String orderId);

    List<KitchenTicket> findByCourseType(String orderId, String courseType);

    KitchenTicket save(KitchenTicket ticket);

    void saveAll(List<KitchenTicket> tickets);

    KitchenTicket update(KitchenTicket ticket);

    void delete(String ticketId);
}
