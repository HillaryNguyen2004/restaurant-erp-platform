package com.hcmut.kitchenoperation.controller;

import com.hcmut.kitchenoperation.domain.model.KitchenStation;
import com.hcmut.kitchenoperation.domain.model.KitchenTicket;
import com.hcmut.kitchenoperation.domain.model.StationDashboard;
import com.hcmut.kitchenoperation.domain.model.TicketAlert;
import com.hcmut.kitchenoperation.domain.model.TicketItem;
import com.hcmut.kitchenoperation.domain.repository.IKitchenStationRepository;
import com.hcmut.kitchenoperation.dto.DashboardMetricsDto;
import com.hcmut.kitchenoperation.dto.FireCourseDto;
import com.hcmut.kitchenoperation.dto.FireCourseResponseDto;
import com.hcmut.kitchenoperation.dto.KitchenStationRequestDto;
import com.hcmut.kitchenoperation.dto.KitchenStationResponseDto;
import com.hcmut.kitchenoperation.dto.StationDashboardDto;
import com.hcmut.kitchenoperation.dto.TicketDetailResponseDto;
import com.hcmut.kitchenoperation.dto.TicketFilterDto;
import com.hcmut.kitchenoperation.dto.TicketItemDto;
import com.hcmut.kitchenoperation.dto.TicketListResponseDto;
import com.hcmut.kitchenoperation.dto.UpdateTicketStatusDto;
import com.hcmut.kitchenoperation.port.IClock;
import com.hcmut.kitchenoperation.service.CourseService;
import com.hcmut.kitchenoperation.service.KitchenService;
import com.hcmut.kitchenoperation.service.TicketAlertEvaluator;
import com.hcmut.kitchenoperation.service.TicketService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.List;
import java.util.Locale;

@RestController
@RequestMapping("/kitchen")
@RequiredArgsConstructor
public class KitchenController {
    private final KitchenService kitchenService;
    private final TicketService ticketService;
    private final CourseService courseService;
    private final IKitchenStationRepository stationRepository;
    private final TicketAlertEvaluator alertEvaluator;
    private final IClock clock;

    @GetMapping("/stations")
    public List<KitchenStationResponseDto> getStations() {
        return stationRepository.findAll().stream().map(this::toStationResponse).toList();
    }

    @GetMapping("/stations/{stationId}")
    public KitchenStationResponseDto getStation(@PathVariable String stationId) {
        KitchenStation station = requireStation(stationId);
        return toStationResponse(station);
    }

    @PostMapping("/stations")
    public KitchenStationResponseDto createStation(@RequestBody KitchenStationRequestDto dto) {
        KitchenStation station = new KitchenStation(
                requireText(dto.getStationId(), "stationId"),
                requireText(dto.getName(), "name"),
                requireText(dto.getStationType(), "stationType"),
                requireDishTypes(dto.getSupportedDishTypes()),
                dto.getActive() == null || dto.getActive()
        );

        return toStationResponse(stationRepository.save(station));
    }

    @PutMapping("/stations/{stationId}")
    public KitchenStationResponseDto updateStation(
            @PathVariable String stationId,
            @RequestBody KitchenStationRequestDto dto
    ) {
        KitchenStation current = requireStation(stationId);
        KitchenStation updated = new KitchenStation(
                stationId,
                defaultIfBlank(dto.getName(), current.getName()),
                defaultIfBlank(dto.getStationType(), current.getStationType()),
                dto.getSupportedDishTypes() == null || dto.getSupportedDishTypes().isEmpty()
                        ? current.getSupportedDishTypes()
                        : dto.getSupportedDishTypes(),
                dto.getActive() == null ? current.isActive() : dto.getActive()
        );

        return toStationResponse(stationRepository.update(updated));
    }

    @DeleteMapping("/stations/{stationId}")
    public void deleteStation(@PathVariable String stationId) {
        requireStation(stationId);
        stationRepository.delete(stationId);
    }

    @GetMapping("/stations/{stationId}/tickets")
    public TicketListResponseDto getStationTickets(
            @PathVariable String stationId,
            @ModelAttribute TicketFilterDto filter
    ) {
        List<KitchenTicket> tickets = ticketService.getTicketsByStation(stationId, filter.getSortBy());

        if (filter.getStatuses() != null && !filter.getStatuses().isEmpty()) {
            List<String> statusFilter = filter.getStatuses().stream()
                    .map(value -> value.toUpperCase(Locale.ROOT))
                    .toList();
            tickets = tickets.stream()
                    .filter(ticket -> statusFilter.contains(ticket.getStatus()))
                    .toList();
        }

        if (filter.getCourseType() != null && !filter.getCourseType().isBlank()) {
            String courseType = filter.getCourseType().toUpperCase(Locale.ROOT);
            tickets = tickets.stream()
                    .filter(ticket -> ticket.getCourseType().toUpperCase(Locale.ROOT).equals(courseType))
                    .toList();
        }

        List<TicketDetailResponseDto> details = tickets.stream().map(this::toTicketDetail).toList();
        return new TicketListResponseDto(details, details.size());
    }

    @GetMapping("/tickets/{ticketId}")
    public TicketDetailResponseDto getTicketDetail(@PathVariable String ticketId) {
        return toTicketDetail(ticketService.getTicketById(ticketId));
    }

    @PatchMapping("/tickets/{ticketId}/status")
    public TicketDetailResponseDto updateTicketStatus(
            @PathVariable String ticketId,
            @RequestBody UpdateTicketStatusDto dto
    ) {
        KitchenTicket ticket = ticketService.updateTicketStatus(ticketId, dto.getNewStatus(), dto.getChangedByUserId());
        return toTicketDetail(ticket);
    }

    @PostMapping("/courses/fire")
    public FireCourseResponseDto fireCourse(@RequestBody FireCourseDto dto) {
        List<KitchenTicket> tickets = courseService.fireCourse(dto.getOrderId(), dto.getCourseType(), dto.getFiredByUserId());
        return new FireCourseResponseDto(
                dto.getOrderId(),
                dto.getCourseType(),
                tickets.stream().map(KitchenTicket::getId).toList(),
                Instant.now()
        );
    }

    @GetMapping("/stations/{stationId}/dashboard")
    public StationDashboardDto getStationDashboard(@PathVariable String stationId) {
        StationDashboard dashboard = kitchenService.getStationDashboard(stationId);
        DashboardMetricsDto metrics = new DashboardMetricsDto(
                dashboard.getPendingCount(),
                dashboard.getInProgressCount(),
                dashboard.getCompletedCount(),
                dashboard.getOverdueCount(),
                dashboard.getAverageElapsedMinutes()
        );

        return new StationDashboardDto(
                dashboard.getStationId(),
                dashboard.getStationName(),
                dashboard.getActiveTickets().stream().map(this::toTicketDetail).toList(),
                metrics
        );
    }

    @GetMapping("/health")
    public String health() {
        return "ok";
    }

    private TicketDetailResponseDto toTicketDetail(KitchenTicket ticket) {
        KitchenStation station = stationRepository.findById(ticket.getStationId());
        Instant now = clock.now();
        TicketAlert alert = alertEvaluator.evaluateTicket(ticket, now);

        return new TicketDetailResponseDto(
                ticket.getId(),
                ticket.getOrderId(),
                ticket.getTableNumber(),
                ticket.getStationId(),
                station == null ? ticket.getStationId() : station.getName(),
                ticket.getStatus(),
                toTicketItems(ticket.getItems()),
                ticket.getCourseType(),
                ticket.getPriority(),
                ticket.calculateElapsedMinutes(now),
                ticket.calculateRemainingMinutes(now),
                alert.getAlertLevel(),
                alert.getColorCode(),
                ticket.hasAllergyAlert(),
                ticket.getSpecialInstructions(),
                ticket.getCreatedAt()
        );
    }

    private List<TicketItemDto> toTicketItems(List<TicketItem> items) {
        return items.stream().map(item -> new TicketItemDto(
                item.getMenuItemName(),
                item.getQuantity(),
                item.getSpecialInstructions(),
                item.getAllergyTags()
        )).toList();
    }

    private KitchenStation requireStation(String stationId) {
        KitchenStation station = stationRepository.findById(stationId);
        if (station == null) {
            throw new IllegalArgumentException("Kitchen station not found: " + stationId);
        }
        return station;
    }

    private KitchenStationResponseDto toStationResponse(KitchenStation station) {
        return new KitchenStationResponseDto(
                station.getId(),
                station.getName(),
                station.getStationType(),
                station.getSupportedDishTypes(),
                station.isActive()
        );
    }

    private List<String> requireDishTypes(List<String> supportedDishTypes) {
        if (supportedDishTypes == null || supportedDishTypes.isEmpty()) {
            throw new IllegalArgumentException("supportedDishTypes cannot be empty");
        }
        return supportedDishTypes;
    }

    private String requireText(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " cannot be empty");
        }
        return value;
    }

    private String defaultIfBlank(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value;
    }
}
