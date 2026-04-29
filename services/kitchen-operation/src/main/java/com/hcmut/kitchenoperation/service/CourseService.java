package com.hcmut.kitchenoperation.service;

import com.hcmut.kitchenoperation.domain.events.CourseFiredEvent;
import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.Order;
import com.hcmut.kitchenoperation.domain.model.OrderItem;
import com.hcmut.kitchenoperation.domain.repository.IKitchenTicketRepository;
import com.hcmut.kitchenoperation.port.IEventPublisher;
import com.hcmut.kitchenoperation.port.IOrderReader;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final IKitchenTicketRepository ticketRepository;
    private final IOrderReader orderReader;
    private final KitchenService kitchenService;
    private final IEventPublisher eventPublisher;

    public List<KitchenTicket> fireCourse(String orderId, String courseType, String userId) {
        validateCourseReadiness(orderId, courseType);
        List<KitchenTicket> tickets = createTicketsForCourse(orderId, courseType);

        if (!tickets.isEmpty()) {
            Order order = orderReader.getOrder(orderId);
            List<String> ticketIds = tickets.stream().map(KitchenTicket::getId).toList();
            eventPublisher.publish(new CourseFiredEvent(
                    orderId,
                    order.getTableNumber(),
                    courseType.toUpperCase(Locale.ROOT),
                    ticketIds,
                    userId
            ));
        }

        return tickets;
    }

    public boolean canFireCourse(String orderId, String courseType) {
        String normalized = courseType.toUpperCase(Locale.ROOT);
        List<OrderItem> courseItems = orderReader.getItemsByCourse(orderId, normalized);
        if (courseItems.isEmpty()) {
            return false;
        }

        List<KitchenTicket> existing = ticketRepository.findByCourseType(orderId, normalized);
        return existing.stream().noneMatch(KitchenTicket::isActive);
    }

    public List<String> getPendingCourses(String orderId) {
        List<String> courseFlow = List.of("APPETIZER", "MAIN", "DESSERT");
        List<String> pending = new ArrayList<>();

        for (int index = 0; index < courseFlow.size(); index++) {
            String course = courseFlow.get(index);
            if (!canFireCourse(orderId, course)) {
                continue;
            }

            if (index == 0) {
                pending.add(course);
                continue;
            }

            String previous = courseFlow.get(index - 1);
            List<KitchenTicket> previousCourseTickets = ticketRepository.findByCourseType(orderId, previous);
            boolean previousCompleted = !previousCourseTickets.isEmpty()
                    && previousCourseTickets.stream().allMatch(ticket -> KitchenTicket.STATUS_COMPLETED.equals(ticket.getStatus()));
            if (previousCompleted) {
                pending.add(course);
            }
        }

        return pending;
    }

    private void validateCourseReadiness(String orderId, String courseType) {
        if (!canFireCourse(orderId, courseType)) {
            throw new IllegalStateException("Course cannot be fired yet: " + courseType);
        }
    }

    private List<KitchenTicket> createTicketsForCourse(String orderId, String courseType) {
        Order order = orderReader.getOrder(orderId);
        List<OrderItem> courseItems = orderReader.getItemsByCourse(orderId, courseType.toUpperCase(Locale.ROOT));
        return kitchenService.routeItemsToKitchen(order, courseItems);
    }
}
