classDiagram
direction TB

%% ========================================
%% CONTROLLER LAYER
%% ========================================
class KitchenController {
  <<Controller>>
  -kitchenService: KitchenService
  -ticketService: TicketService
  -courseService: CourseService
  +routeOrderToKitchen(dto: RouteOrderDto): RouteOrderResponseDto
  +getStationTickets(stationId: string, filter: TicketFilterDto): TicketListResponseDto
  +getTicketDetail(ticketId: string): TicketDetailResponseDto
  +updateTicketStatus(ticketId: string, dto: UpdateTicketStatusDto): TicketDetailResponseDto
  +fireCourse(dto: FireCourseDto): FireCourseResponseDto
  +getStationDashboard(stationId: string): StationDashboardDto
}

%% ========================================
%% SERVICE LAYER
%% ========================================
class KitchenService {
  <<Service>>
  -ticketRepository: IKitchenTicketRepository
  -stationRepository: IKitchenStationRepository
  -orderReader: IOrderReader
  -eventPublisher: IEventPublisher
  -clock: IClock
  +routeOrderToKitchen(orderId: string): KitchenTicket[]
  +getStationDashboard(stationId: string): StationDashboard
  -groupItemsByStation(items: OrderItem[]): Map<string, OrderItem[]>
  -createTicketsForStation(order: Order, items: OrderItem[], station: KitchenStation): KitchenTicket
  -calculateDashboardMetrics(tickets: KitchenTicket[]): DashboardMetrics
}

class TicketService {
  <<Service>>
  -ticketRepository: IKitchenTicketRepository
  -priorityCalculator: TicketPriorityCalculator
  -alertEvaluator: TicketAlertEvaluator
  -eventPublisher: IEventPublisher
  -notificationService: INotificationService
  -clock: IClock
  +getTicketsByStation(stationId: string, sortBy: string): KitchenTicket[]
  +getTicketById(ticketId: string): KitchenTicket
  +updateTicketStatus(ticketId: string, newStatus: string, userId: string): KitchenTicket
  +recalculatePriorities(stationId: string): void
  +evaluateAlerts(stationId: string): TicketAlert[]
  -sortTickets(tickets: KitchenTicket[], sortBy: string): KitchenTicket[]
  -checkAndTriggerAlert(ticket: KitchenTicket): void
}

class CourseService {
  <<Service>>
  -ticketRepository: IKitchenTicketRepository
  -orderReader: IOrderReader
  -kitchenService: KitchenService
  -eventPublisher: IEventPublisher
  +fireCourse(orderId: string, courseType: string, userId: string): KitchenTicket[]
  +canFireCourse(orderId: string, courseType: string): boolean
  +getPendingCourses(orderId: string): string[]
  -validateCourseReadiness(orderId: string, courseType: string): void
  -createTicketsForCourse(orderId: string, courseType: string): KitchenTicket[]
}

class TicketPriorityCalculator {
  <<Service>>
  -clock: IClock
  +calculatePriority(ticket: KitchenTicket): number
  +sortByPriority(tickets: KitchenTicket[]): KitchenTicket[]
  -calculateUrgencyScore(ticket: KitchenTicket, currentTime: Date): number
  -getPreparationProgress(ticket: KitchenTicket, currentTime: Date): number
}

class TicketAlertEvaluator {
  <<Service>>
  -warningThreshold: number
  -criticalThreshold: number
  +evaluateTicket(ticket: KitchenTicket, currentTime: Date): TicketAlert
  +shouldNotify(ticket: KitchenTicket, currentTime: Date): boolean
  -determineAlertLevel(progressPercent: number): string
  -getAlertColor(level: string): string
}

%% ========================================
%% DOMAIN MODEL LAYER
%% ========================================
class KitchenTicket {
  <<Aggregate Root>>
  -id: string
  -orderId: string
  -tableNumber: string
  -stationId: string
  -items: TicketItem[]
  -courseType: string
  -status: string
  -priority: number
  -prepTimeMinutes: number
  -specialInstructions: string
  -createdAt: Date
  -startedAt: Date
  -completedAt: Date
  +changeStatus(newStatus: string, timestamp: Date): void
  +setPriority(priority: number): void
  +calculateElapsedMinutes(currentTime: Date): number
  +calculateRemainingMinutes(currentTime: Date): number
  +getEstimatedCompletionTime(): Date
  +hasAllergyAlert(): boolean
  +isOverdue(currentTime: Date): boolean
  +isActive(): boolean
  +canTransitionTo(newStatus: string): boolean
}

class TicketItem {
  <<Entity>>
  -id: string
  -orderItemId: string
  -menuItemName: string
  -dishType: string
  -quantity: number
  -specialInstructions: string
  -allergyTags: string[]
  -prepTimeMinutes: number
  +hasAllergyTags(): boolean
  +getDisplayText(): string
}

class KitchenStation {
  <<Entity>>
  -id: string
  -name: string
  -stationType: string
  -supportedDishTypes: string[]
  -isActive: boolean
  +canHandle(dishType: string): boolean
  +activate(): void
  +deactivate(): void
}

class Order {
  <<Value Object>>
  +orderId: string
  +tableNumber: string
  +orderStatus: string
  +specialInstructions: string
  +createdAt: Date
}

class OrderItem {
  <<Value Object>>
  +orderItemId: string
  +menuItemId: string
  +menuItemName: string
  +dishType: string
  +courseType: string
  +quantity: number
  +specialInstructions: string
  +allergyTags: string[]
  +prepTimeMinutes: number
}

class TicketAlert {
  <<Value Object>>
  +ticketId: string
  +stationId: string
  +alertLevel: string
  +elapsedMinutes: number
  +remainingMinutes: number
  +progressPercent: number
  +colorCode: string
  +message: string
  +timestamp: Date
}

class StationDashboard {
  <<Value Object>>
  +stationId: string
  +stationName: string
  +activeTickets: KitchenTicket[]
  +pendingCount: number
  +inProgressCount: number
  +completedCount: number
  +overdueCount: number
  +averageElapsedMinutes: number
}

class DashboardMetrics {
  <<Value Object>>
  +pendingCount: number
  +inProgressCount: number
  +completedCount: number
  +overdueCount: number
  +averageElapsedMinutes: number
  +totalActiveCount: number
}

%% ========================================
%% DOMAIN EVENTS
%% ========================================
class DomainEvent {
  <<Abstract>>
  #eventId: string
  #occurredAt: Date
}

class TicketCreatedEvent {
  <<Event>>
  +ticketId: string
  +orderId: string
  +tableNumber: string
  +stationId: string
  +courseType: string
  +hasAllergyAlert: boolean
  +occurredAt: Date
}

class TicketStatusChangedEvent {
  <<Event>>
  +ticketId: string
  +orderId: string
  +oldStatus: string
  +newStatus: string
  +changedByUserId: string
  +occurredAt: Date
}

class TicketAlertTriggeredEvent {
  <<Event>>
  +ticketId: string
  +stationId: string
  +alertLevel: string
  +remainingMinutes: number
  +occurredAt: Date
}

class CourseFiredEvent {
  <<Event>>
  +orderId: string
  +tableNumber: string
  +courseType: string
  +ticketIds: string[]
  +firedByUserId: string
  +occurredAt: Date
}

%% ========================================
%% REPOSITORY INTERFACES
%% ========================================
class IKitchenTicketRepository {
  <<Interface>>
  +findById(ticketId: string): KitchenTicket
  +findByStationId(stationId: string): KitchenTicket[]
  +findActiveByStationId(stationId: string): KitchenTicket[]
  +findByOrderId(orderId: string): KitchenTicket[]
  +findByCourseType(orderId: string, courseType: string): KitchenTicket[]
  +save(ticket: KitchenTicket): KitchenTicket
  +saveAll(tickets: KitchenTicket[]): void
  +update(ticket: KitchenTicket): KitchenTicket
  +delete(ticketId: string): void
}

class IKitchenStationRepository {
  <<Interface>>
  +findById(stationId: string): KitchenStation
  +findByDishType(dishType: string): KitchenStation
  +findAllActive(): KitchenStation[]
  +save(station: KitchenStation): KitchenStation
  +update(station: KitchenStation): KitchenStation
}

class KitchenTicketRepositoryImpl {
  <<Repository>>
  -database: Database
  +findById(ticketId: string): KitchenTicket
  +findByStationId(stationId: string): KitchenTicket[]
  +findActiveByStationId(stationId: string): KitchenTicket[]
  +findByOrderId(orderId: string): KitchenTicket[]
  +findByCourseType(orderId: string, courseType: string): KitchenTicket[]
  +save(ticket: KitchenTicket): KitchenTicket
  +saveAll(tickets: KitchenTicket[]): void
  +update(ticket: KitchenTicket): KitchenTicket
  +delete(ticketId: string): void
  -mapToEntity(row: any): KitchenTicket
  -mapToRow(ticket: KitchenTicket): any
}

class KitchenStationRepositoryImpl {
  <<Repository>>
  -database: Database
  -cache: Map
  +findById(stationId: string): KitchenStation
  +findByDishType(dishType: string): KitchenStation
  +findAllActive(): KitchenStation[]
  +save(station: KitchenStation): KitchenStation
  +update(station: KitchenStation): KitchenStation
  -mapToEntity(row: any): KitchenStation
  -mapToRow(station: KitchenStation): any
}

%% ========================================
%% EXTERNAL ADAPTERS (Interfaces only for external dependencies)
%% ========================================
class IOrderReader {
  <<Interface>>
  +getOrder(orderId: string): Order
  +getOrderItems(orderId: string): OrderItem[]
  +getItemsByCourse(orderId: string, courseType: string): OrderItem[]
}

class OrderReaderAdapter {
  <<Adapter>>
  -orderServiceClient: OrderServiceClient
  +getOrder(orderId: string): Order
  +getOrderItems(orderId: string): OrderItem[]
  +getItemsByCourse(orderId: string, courseType: string): OrderItem[]
  -mapToOrder(response: any): Order
  -mapToOrderItems(response: any): OrderItem[]
}

class IEventPublisher {
  <<Interface>>
  +publish(event: DomainEvent): void
  +publishBatch(events: DomainEvent[]): void
}

class KafkaEventPublisher {
  <<Adapter>>
  -kafkaProducer: KafkaProducer
  -topicConfig: TopicConfig
  +publish(event: DomainEvent): void
  +publishBatch(events: DomainEvent[]): void
  -getTopicName(event: DomainEvent): string
  -serializeEvent(event: DomainEvent): string
}

class INotificationService {
  <<Interface>>
  +notifyStation(stationId: string, message: any): void
  +notifyStaff(userId: string, message: any): void
  +broadcastToKitchen(message: any): void
}

class WebSocketNotificationService {
  <<Adapter>>
  -webSocketGateway: WebSocketGateway
  +notifyStation(stationId: string, message: any): void
  +notifyStaff(userId: string, message: any): void
  +broadcastToKitchen(message: any): void
}

class IClock {
  <<Interface>>
  +now(): Date
}

class SystemClock {
  <<Adapter>>
  +now(): Date
}

%% ========================================
%% DTOs
%% ========================================
class RouteOrderDto {
  <<DTO>>
  +orderId: string
}

class RouteOrderResponseDto {
  <<DTO>>
  +orderId: string
  +tableNumber: string
  +ticketIds: string[]
  +stationCount: number
  +timestamp: Date
}

class TicketFilterDto {
  <<DTO>>
  +statuses: string[]
  +courseType: string
  +sortBy: string
}

class TicketListResponseDto {
  <<DTO>>
  +tickets: TicketDetailResponseDto[]
  +totalCount: number
}

class TicketDetailResponseDto {
  <<DTO>>
  +ticketId: string
  +orderId: string
  +tableNumber: string
  +stationId: string
  +stationName: string
  +status: string
  +items: TicketItemDto[]
  +courseType: string
  +priority: number
  +elapsedMinutes: number
  +remainingMinutes: number
  +alertLevel: string
  +colorCode: string
  +hasAllergyAlert: boolean
  +specialInstructions: string
  +createdAt: Date
}

class TicketItemDto {
  <<DTO>>
  +menuItemName: string
  +quantity: number
  +specialInstructions: string
  +allergyTags: string[]
}

class UpdateTicketStatusDto {
  <<DTO>>
  +newStatus: string
  +changedByUserId: string
}

class FireCourseDto {
  <<DTO>>
  +orderId: string
  +courseType: string
  +firedByUserId: string
}

class FireCourseResponseDto {
  <<DTO>>
  +orderId: string
  +courseType: string
  +ticketIds: string[]
  +timestamp: Date
}

class StationDashboardDto {
  <<DTO>>
  +stationId: string
  +stationName: string
  +tickets: TicketDetailResponseDto[]
  +metrics: DashboardMetricsDto
}

class DashboardMetricsDto {
  <<DTO>>
  +pendingCount: number
  +inProgressCount: number
  +completedCount: number
  +overdueCount: number
  +averageElapsedMinutes: number
}

%% ========================================
%% RELATIONSHIPS
%% ========================================

%% Controller Dependencies
KitchenController --> KitchenService
KitchenController --> TicketService
KitchenController --> CourseService

%% Service Dependencies
KitchenService --> IKitchenTicketRepository
KitchenService --> IKitchenStationRepository
KitchenService --> IOrderReader
KitchenService --> IEventPublisher
KitchenService --> IClock

TicketService --> IKitchenTicketRepository
TicketService --> TicketPriorityCalculator
TicketService --> TicketAlertEvaluator
TicketService --> IEventPublisher
TicketService --> INotificationService
TicketService --> IClock

CourseService --> IKitchenTicketRepository
CourseService --> IOrderReader
CourseService --> KitchenService
CourseService --> IEventPublisher

TicketPriorityCalculator --> IClock
TicketAlertEvaluator --> IClock

%% Repository Implementations
IKitchenTicketRepository <|.. KitchenTicketRepositoryImpl
IKitchenStationRepository <|.. KitchenStationRepositoryImpl

%% Adapter Implementations
IOrderReader <|.. OrderReaderAdapter
IEventPublisher <|.. KafkaEventPublisher
INotificationService <|.. WebSocketNotificationService
IClock <|.. SystemClock

%% Domain Model Relationships
KitchenTicket "1" *-- "1..*" TicketItem : contains
StationDashboard "1" o-- "*" KitchenTicket : displays

%% Event Hierarchy
DomainEvent <|-- TicketCreatedEvent
DomainEvent <|-- TicketStatusChangedEvent
DomainEvent <|-- TicketAlertTriggeredEvent
DomainEvent <|-- CourseFiredEvent

%% Services use Domain Models
KitchenService ..> KitchenTicket
KitchenService ..> KitchenStation
KitchenService ..> Order
KitchenService ..> OrderItem
KitchenService ..> StationDashboard
KitchenService ..> DashboardMetrics
KitchenService ..> TicketCreatedEvent

TicketService ..> KitchenTicket
TicketService ..> TicketAlert
TicketService ..> TicketStatusChangedEvent
TicketService ..> TicketAlertTriggeredEvent

CourseService ..> KitchenTicket
CourseService ..> Order
CourseService ..> OrderItem
CourseService ..> CourseFiredEvent

TicketPriorityCalculator ..> KitchenTicket
TicketAlertEvaluator ..> KitchenTicket
TicketAlertEvaluator ..> TicketAlert

%% Controller uses DTOs
KitchenController ..> RouteOrderDto
KitchenController ..> RouteOrderResponseDto
KitchenController ..> TicketFilterDto
KitchenController ..> TicketListResponseDto
KitchenController ..> TicketDetailResponseDto
KitchenController ..> TicketItemDto
KitchenController ..> UpdateTicketStatusDto
KitchenController ..> FireCourseDto
KitchenController ..> FireCourseResponseDto
KitchenController ..> StationDashboardDto
KitchenController ..> DashboardMetricsDto