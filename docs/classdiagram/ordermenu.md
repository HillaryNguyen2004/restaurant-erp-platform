classDiagram
direction TB

%% =========================
%% API LAYER
%% =========================
class OrderSessionController {
<<API>>
-facade: OrderSessionFacade
+openSession(request: OpenSessionRequest) OrderSessionDto
+closeSession(sessionId: UUID) void
+getSession(sessionId: UUID) OrderSessionDto
+getSessionByTable(tableId: UUID) OrderSessionDto
+placeOrder(sessionId: UUID, request: PlaceOrderRequest) OrderDto
+cancelOrder(sessionId: UUID, orderId: UUID, reason: String) void
+updateOrderItem(sessionId: UUID, orderId: UUID, itemId: UUID, request: UpdateOrderItemRequest) OrderDto
}

class MenuController {
<<API>>
-facade: MenuFacade
+getMenu() MenuDto
+getMenuByCategory(menuCategoryId: UUID) MenuItemDto[]
+getMenuItem(itemId: UUID) MenuItemDto
}

class MenuManagementController {
<<API>>
-facade: MenuFacade
+createMenuItem(request: CreateMenuItemRequest) MenuItemDto
+updateMenuItem(itemId: UUID, request: UpdateMenuItemRequest) MenuItemDto
+deleteMenuItem(itemId: UUID) void
+markItemUnavailable(itemId: UUID, reason: String) void
+markItemAvailable(itemId: UUID) void
+createCategory(request: CreateMenuCategoryRequest) MenuCategoryDto
+updateCategory(categoryId: UUID, request: UpdateMenuCategoryRequest) MenuCategoryDto
+deleteCategory(categoryId: UUID) void
}

class PromotionController {
<<API>>
-facade: PromotionFacade
+createPromotion(request: CreatePromotionRequest) PromotionDto
+updatePromotion(promoId: UUID, request: UpdatePromotionRequest) PromotionDto
+getActivePromotions() PromotionDto[]
+deletePromotion(promoId: UUID) void
}

%% =========================
%% BUSINESS LAYER - FACADES
%% =========================
class OrderSessionFacade {
<<Facade>>
-sessionOpener: SessionOpener
-sessionCloser: SessionCloser
-sessionRetriever: SessionRetriever
+orderPlacer: OrderPlacer
+orderCanceller: OrderCanceller
+orderUpdater: OrderUpdater
+openSession(request: OpenSessionRequest) OrderSessionDto
+closeSession(sessionId: UUID) void
+getSession(sessionId: UUID) OrderSessionDto
+getSessionByTable(tableId: UUID) OrderSessionDto
+placeOrder(sessionId: UUID, request: PlaceOrderRequest) OrderDto
+cancelOrder(sessionId: UUID, orderId: UUID, reason: String) void
+updateOrderItem(sessionId: UUID, orderId: UUID, itemId: UUID, request: UpdateOrderItemRequest) OrderDto
}

class MenuFacade {
<<Facade>>
-menuRetriever: MenuRetriever
-menuItemCreator: MenuItemCreator
-menuItemUpdater: MenuItemUpdater
-menuItemDeleter: MenuItemDeleter
-menuAvailabilityManager: MenuAvailabilityManager
-menuCategoryCreator: MenuCategoryCreator
-menuCategoryUpdater: MenuCategoryUpdater
-menuCategoryDeleter: MenuCategoryDeleter
-menuCategoryRepository: IMenuCategoryRepository
+getMenu() MenuDto
+getMenuByCategory(menuCategoryId: UUID) MenuItemDto[]
+getMenuItem(itemId: UUID) MenuItemDto
+createMenuItem(request: CreateMenuItemRequest) MenuItemDto
+updateMenuItem(itemId: UUID, request: UpdateMenuItemRequest) MenuItemDto
+deleteMenuItem(itemId: UUID) void
+markItemUnavailable(itemId: UUID, reason: String) void
+markItemAvailable(itemId: UUID) void
+createCategory(request: CreateMenuCategoryRequest) MenuCategoryDto
+updateCategory(categoryId: UUID, request: UpdateMenuCategoryRequest) MenuCategoryDto
+deleteCategory(categoryId: UUID) void
}

class PromotionFacade {
<<Facade>>
-promotionCreator: PromotionCreator
-promotionUpdater: PromotionUpdater
-promotionRetriever: PromotionRetriever
-promotionDeleter: PromotionDeleter
+createPromotion(request: CreatePromotionRequest) PromotionDto
+updatePromotion(promoId: UUID, request: UpdatePromotionRequest) PromotionDto
+getActivePromotions() PromotionDto[]
+deletePromotion(promoId: UUID) void
}

%% =========================
%% BUSINESS LAYER - SERVICES
%% =========================
class SessionOpener {
<<Service>>
-sessionRepository: IOrderSessionRepository
-tableServiceClient: ITableServiceClient
-sessionValidator: SessionValidator
-sessionFactory: OrderSessionFactory
-eventPublisher: SessionEventPublisher
+open(request: OpenSessionRequest) OrderSession
}

class SessionCloser {
<<Service>>
-sessionRepository: IOrderSessionRepository
-eventPublisher: SessionEventPublisher
+close(sessionId: UUID) void
}

class SessionRetriever {
<<Service>>
-sessionRepository: IOrderSessionRepository
+getById(sessionId: UUID) OrderSession
+getByTable(tableId: UUID) OrderSession
+getActiveByTable(tableId: UUID) OrderSession
+getByStatus(status: SessionStatus) OrderSession[]
}

class OrderPlacer {
<<Service>>
-sessionRepository: IOrderSessionRepository
-menuItemRepository: IMenuItemRepository
-menuAvailabilityManager: MenuAvailabilityManager
+orderValidator: OrderValidator
+orderFactory: OrderFactory
+eventPublisher: OrderEventPublisher
+placeOrder(sessionId: UUID, request: PlaceOrderRequest) Order
}

class OrderCanceller {
<<Service>>
-sessionRepository: IOrderSessionRepository
+eventPublisher: OrderEventPublisher
+cancel(sessionId: UUID, orderId: UUID, reason: String) void
}

class OrderUpdater {
<<Service>>
-sessionRepository: IOrderSessionRepository
-menuItemRepository: IMenuItemRepository
-menuAvailabilityManager: MenuAvailabilityManager
+orderValidator: OrderValidator
+eventPublisher: OrderEventPublisher
+updateItem(sessionId: UUID, orderId: UUID, itemId: UUID, request: UpdateOrderItemRequest) Order
}

class MenuRetriever {
<<Service>>
-menuItemRepository: IMenuItemRepository
-menuCategoryRepository: IMenuCategoryRepository
+getAll() MenuItem[]
+getByCategory(menuCategoryId: UUID) MenuItem[]
+getById(itemId: UUID) MenuItem
}

class MenuItemCreator {
<<Service>>
-menuItemRepository: IMenuItemRepository
-menuCategoryRepository: IMenuCategoryRepository
-menuItemFactory: MenuItemFactory
-eventPublisher: MenuEventPublisher
+create(request: CreateMenuItemRequest) MenuItem
}

class MenuItemUpdater {
<<Service>>
-menuItemRepository: IMenuItemRepository
-eventPublisher: MenuEventPublisher
+update(itemId: UUID, request: UpdateMenuItemRequest) MenuItem
}

class MenuItemDeleter {
<<Service>>
-menuItemRepository: IMenuItemRepository
-eventPublisher: MenuEventPublisher
+delete(itemId: UUID) void
}

class MenuAvailabilityManager {
<<Service>>

-

class MenuCategoryCreator {
<<Service>>
-menuCategoryRepository: IMenuCategoryRepository
+create(request: CreateMenuCategoryRequest) MenuCategory
}

class MenuCategoryUpdater {
<<Service>>
-menuCategoryRepository: IMenuCategoryRepository
+update(categoryId: UUID, request: UpdateMenuCategoryRequest) MenuCategory
}

class MenuCategoryDeleter {
<<Service>>
-menuCategoryRepository: IMenuCategoryRepository
+delete(categoryId: UUID) void
}menuItemRepository: IMenuItemRepository
-availabilityCache: IAvailabilityCache
-eventPublisher: MenuEventPublisher
+markUnavailable(itemId: UUID, reason: String) void
+markAvailable(itemId: UUID) void
+isAvailable(itemId: UUID) bool
+checkAvailability(itemIds: UUID[]) Map~UUID_bool~
}

class PromotionCreator {
<<Service>>
-promotionRepository: IPromotionRepository
-promotionValidator: PromotionValidator
-eventPublisher: PromotionEventPublisher
+create(request: CreatePromotionRequest) Promotion
}

class PromotionUpdater {
<<Service>>
-promotionRepository: IPromotionRepository
-eventPublisher: PromotionEventPublisher
+update(promoId: UUID, request: UpdatePromotionRequest) Promotion
}

class PromotionRetriever {
<<Service>>
-promotionRepository: IPromotionRepository
+getActive() Promotion[]
+getById(promoId: UUID) Promotion
+getApplicableToItem(itemId: UUID) Promotion[]
}

class PromotionDeleter {
<<Service>>
-promotionRepository: IPromotionRepository
-eventPublisher: PromotionEventPublisher
+delete(promoId: UUID) void
}

%% =========================
%% VALIDATORS
%% =========================
class SessionValidator {
<<Validator>>
-tableServiceClient: ITableServiceClient
+validateOpenRequest(request: OpenSessionRequest) void
+validateTableAvailability(tableId: UUID) void
+validateGuestCount(tableId: UUID, guestCount: int) void
}

class OrderValidator {
<<Validator>>
-menuAvailabilityManager: MenuAvailabilityManager
+validatePlaceRequest(request: PlaceOrderRequest) void
+validateItemAvailability(items: OrderItem[]) void
+validateSessionActive(session: OrderSession) void
+validateOrderModifiable(order: Order) void
+validateAllergyConflicts(session: OrderSession, items: OrderItem[]) void
}

class PromotionValidator {
<<Validator>>
+validateCreateRequest(request: CreatePromotionRequest) void
+validateDateRange(validFrom: DateTime, validTo: DateTime) void
+validateDiscountValue(type: DiscountType, value: Decimal) void
}

%% =========================
%% FACTORIES
%% =========================
class OrderSessionFactory {
<<Factory>>
+createSession(request: OpenSessionRequest) OrderSession
}

class OrderFactory {
<<Factory>>
+createOrder(session: OrderSession, request: PlaceOrderRequest, menuItems: MenuItem[]) Order
+createOrderItem(menuItem: MenuItem, quantity: int, modifiers: String[], instructions: String) OrderItem
}

class MenuItemFactory {
<<Factory>>
+createMenuItem(request: CreateMenuItemRequest, menuCategory: MenuCategory) MenuItem
}

%% =========================
%% EVENT PUBLISHERS
%% =========================
class SessionEventPublisher {
<<Publisher>>
+publishSessionOpened(session: OrderSession) void
+publishSessionClosed(session: OrderSession) void
}

class OrderEventPublisher {
<<Publisher>>
+publishOrderPlaced(order: Order) void
+publishOrderCancelled(order: Order, reason: String) void
+publishOrderItemUpdated(order: Order) void
+publishOrderServed(order: Order) void
}

class MenuEventPublisher {
<<Publisher>>
+publishMenuItemCreated(item: MenuItem) void
+publishMenuItemUpdated(item: MenuItem) void
+publishMenuItemDeleted(itemId: UUID) void
+publishMenuItemUnavailable(itemId: UUID, reason: String) void
+publishMenuItemAvailable(itemId: UUID) void
}

class PromotionEventPublisher {
<<Publisher>>
+publishPromotionCreated(promotion: Promotion) void
+publishPromotionUpdated(promotion: Promotion) void
+publishPromotionDeleted(promoId: UUID) void
}

%% =========================
%% EXTERNAL SERVICE CLIENTS
%% (Anti-corruption layer to other modules)
%% =========================
class ITableServiceClient {
<<ExternalClient>>
+getTable(tableId: UUID) TableSummary
+isTableAvailable(tableId: UUID) bool
+notifySessionOpened(tableId: UUID, sessionId: UUID) void
+notifySessionClosed(tableId: UUID, sessionId: UUID) void
}

%% =========================
%% DOMAIN ENTITIES
%% =========================
class OrderSession {
<<AggregateRoot>>
+id: UUID
+sessionNumber: String
+tableId: UUID
+status: SessionStatus
+guestCount: int
+orders: Order[]
+allergyTags: AllergyTag[]
+openedAt: DateTime
+closedAt: DateTime
+staffId: UUID
+notes: String
+placeOrder(order: Order) void
+cancelOrder(orderId: UUID, reason: String) void
+close() void
+calculateSubtotal() Money
+getActiveOrders() Order[]
}

class Order {
<<Entity>>
+id: UUID
+orderNumber: int
+sessionId: UUID
+status: OrderStatus
+items: OrderItem[]
+placedAt: DateTime
+servedAt: DateTime
+placedByStaffId: UUID
+notes: String
+addItem(item: OrderItem) void
+removeItem(itemId: UUID) void
+updateItemQuantity(itemId: UUID, quantity: int) void
+markPreparing() void
+markReady() void
+markServed() void
+cancel(reason: String) void
+calculateSubtotal() Money
+isModifiable() bool
}

class OrderItem {
<<Entity>>
+id: UUID
+menuItemId: UUID
+menuItemName: String
+quantity: int
+unitPrice: Money
+modifiers: String[]
+specialInstructions: String
+stationType: StationType
+allergyTags: AllergyTag[]
+updateQuantity(quantity: int) void
+calculateSubtotal() Money
}

class MenuItem {
<<AggregateRoot>>
+id: UUID
+name: String
+menuCategoryId: UUID
+price: Money
+isAvailable: bool
+isActive: bool
+prepTimeMinutes: int
+allergyInfo: AllergyTag[]
+stationType: StationType
+markUnavailable(reason: String) void
+markAvailable() void
+updatePrice(newPrice: Money) void
+deactivate() void
}

class MenuCategory {
<<AggregateRoot>>
+id: UUID
+name: String
+displayOrder: int
+isActive: bool
+updateDisplayOrder(order: int) void
+activate() void
+deactivate() void
}

class Promotion {
<<AggregateRoot>>
+id: UUID
+name: String
+discountType: DiscountType
+discountValue: Decimal
+validFrom: DateTime
+validTo: DateTime
+applicableItems: UUID[]
+isActive: bool
+activate() void
+deactivate() void
+isValidAt(checkTime: DateTime) bool
+isApplicableToItem(itemId: UUID) bool
+calculateDiscount(amount: Money) Money
}

%% =========================
%% VALUE OBJECTS
%% =========================
class Money {
<<ValueObject>>
+amount: Decimal
+currency: String
+add(other: Money) Money
+subtract(other: Money) Money
+multiply(factor: Decimal) Money
+equals(other: Money) bool
}

class AllergyTag {
<<ValueObject>>
+tag: String
+severity: AllergySeverity
+equals(other: AllergyTag) bool
}

class TableSummary {
<<ValueObject>>
+tableId: UUID
+tableNumber: String
+capacity: int
+status: String
}

%% =========================
%% ENUMERATIONS
%% =========================
class SessionStatus {
<<enumeration>>
ACTIVE
CLOSED
}

class StationType {
<<enumeration>>
GRILL
FRYER
DESSERT
DRINK
APPETIZER
GENERAL
}

class DiscountType {
<<enumeration>>
PERCENTAGE
FIXED_AMOUNT
BUY_X_GET_Y
}

class AllergySeverity {
<<enumeration>>
LOW
MEDIUM
HIGH
CRITICAL
}

%% =========================
%% DTOs
%% =========================
class OpenSessionRequest {
<<DTO>>
+tableId: UUID
+guestCount: int
+allergyTags: AllergyTag[]
+staffId: UUID
+notes: String
}

class PlaceOrderRequest {
<<DTO>>
+items: OrderItemRequest[]
+notes: String
+staffId: UUID
}

class OrderItemRequest {
<<DTO>>
+menuItemId: UUID
+quantity: int
+modifiers: String[]
+specialInstructions: String
}

class UpdateOrderItemRequest {
<<DTO>>
+quantity: int
+modifiers: String[]
+specialInstructions: String
}

class CreateMenuItemRequest {
<<DTO>>
+name: String
+menuCategoryId: UUID
+price: Decimal
+prepTime: int
+allergyInfo: AllergyTag[]
+stationType: StationType
}

class UpdateMenuItemRequest {
<<DTO>>
+name: String
+price: Decimal
+isActive: bool
+prepTime: int
}

class CreatePromotionRequest {
<<DTO>>
+name: String
+discountType: DiscountType
+discountValue: Decimal
+validFrom: DateTime
+validTo: DateTime
+applicableItems: UUID[]
}

class UpdatePromotionRequest {
<<DTO>>
+name: String
+discountValue: Decimal
+validFrom: DateTime
+validTo: DateTime
+isActive: bool
}

class OrderSessionDto {
<<DTO>>
+sessionId: UUID
+sessionNumber: String
+tableId: UUID
+tableNumber: String
+status: SessionStatus
+guestCount: int
+orders: OrderDto[]
+subtotal: Decimal
+openedAt: DateTime
}

class OrderDto {
<<DTO>>
+orderId: UUID
+orderNumber: int
+status: OrderStatus
+items: OrderItemDto[]
+subtotal: Decimal
+placedAt: DateTime
+servedAt: DateTime
}

class OrderItemDto {
<<DTO>>
+id: UUID
+menuItemId: UUID
+itemName: String
+quantity: int
+unitPrice: Decimal
+subtotal: Decimal
+modifiers: String[]
+specialInstructions: String
+stationType: StationType
}

class MenuItemDto {
<<DTO>>
+id: UUID
+name: String
+menuCategoryId: UUID
+price: Decimal
+isAvailable: bool
+allergyTags: AllergyTag[]
+stationType: StationType
}

class MenuDto {
<<DTO>>
+categories: MenuCategoryDto[]
+items: MenuItemDto[]
}

class MenuCategoryDto {
<<DTO>>
+id: UUID
+name: String
+displayOrder: int
+isActive: bool
}

class PromotionDto {
<<DTO>>
+id: UUID
+name: String
+discountType: DiscountType
+discountValue: Decimal
+validFrom: DateTime
+validTo: DateTime
+applicableItems: UUID[]
+isActive: bool
}

%% =========================
%% REPOSITORIES
%% =========================
class IOrderSessionRepository {
<<Repository>>
+save(session: OrderSession) OrderSession
+findById(sessionId: UUID) OrderSession
+findByTable(tableId: UUID) OrderSession[]
+findActiveByTable(tableId: UUID) OrderSession
+findByStatus(status: SessionStatus) OrderSession[]
}

class IOrderRepository {
<<Repository>>
+save(order: Order) Order
+findById(orderId: UUID) Order
+findBySession(sessionId: UUID) Order[]
+findByStatus(status: OrderStatus) Order[]
}

class IMenuItemRepository {
<<Repository>>
+save(item: MenuItem) MenuItem
+findById(itemId: UUID) MenuItem
+findAll() MenuItem[]
+findByCategory(menuCategoryId: UUID) MenuItem[]
+delete(itemId: UUID) void
}

class IMenuCategoryRepository {
<<Repository>>
+save(menuCategory: MenuCategory) MenuCategory
+findById(menuCategoryId: UUID) MenuCategory
+findAll() MenuCategory[]
}

class IPromotionRepository {
<<Repository>>
+save(promotion: Promotion) Promotion
+findById(promoId: UUID) Promotion
+findActive(now: DateTime) Promotion[]
+findByApplicableItem(itemId: UUID) Promotion[]
+delete(promoId: UUID) void
}

class IAvailabilityCache {
<<Cache>>
+markUnavailable(itemId: UUID) void
+markAvailable(itemId: UUID) void
+isAvailable(itemId: UUID) bool
}

%% =========================
%% API -> FACADE
%% =========================
OrderSessionController ..> OrderSessionFacade : use
MenuController ..> MenuFacade : use
MenuManagementController ..> MenuFacade : use
PromotionController ..> PromotionFacade : use

%% =========================
%% FACADE -> SERVICES
%% =========================
OrderSessionFacade ..> SessionOpener : use
OrderSessionFacade ..> SessionCloser : use
OrderSessionFacade ..> SessionRetriever : use
OrderSessionFacade ..> OrderPlacer : use
OrderSessionFacade ..> OrderCanceller : use
OrderSessionFacade ..> OrderUpdater : use

MenuFacade ..> MenuRetriever : use
MenuFacade ..> MenuItemCreator : use
MenuFacade ..> MenuItemUpdater : use
MenuFacade ..> MenuItemDeleter : use
MenuFacade ..> MenuAvailabilityManager : use

PromotionFacade ..> PromotionCreator : use
PromotionFacade ..> PromotionUpdater : use
PromotionFacade ..> PromotionRetriever : use
PromotionFacade ..> PromotionDeleter : use

%% =========================
%% SERVICES -> DEPENDENCIES
%% =========================
SessionOpener ..> IOrderSessionRepository : use
SessionOpener ..> ITableServiceClient : use
SessionOpener ..> SessionValidator : use
SessionOpener ..> OrderSessionFactory : use
SessionOpener ..> SessionEventPublisher : use

SessionCloser ..> IOrderSessionRepository : use
SessionCloser ..> ITableServiceClient : use
SessionCloser ..> SessionEventPublisher : use

SessionRetriever ..> IOrderSessionRepository : use

OrderPlacer ..> IOrderSessionRepository : use
OrderPlacer ..> IMenuItemRepository : use
OrderPlacer ..> MenuAvailabilityManager : use
OrderPlacer ..> OrderValidator : use
OrderPlacer ..> OrderFactory : use
OrderPlacer ..> OrderEventPublisher : use

OrderCanceller ..> IOrderSessionRepository : use
OrderCanceller ..> OrderEventPublisher : use

OrderUpdater ..> IOrderSessionRepository : use
OrderUpdater ..> IMenuItemRepository : use
OrderUpdater ..> MenuAvailabilityManager : use
OrderUpdater ..> OrderValidator : use
OrderUpdater ..> OrderEventPublisher : use

MenuRetriever ..> IMenuItemRepository : use
MenuRetriever ..> IMenuCategoryRepository : use

MenuItemCreator ..> IMenuItemRepository : use
MenuItemCreator ..> IMenuCategoryRepository : use
MenuItemCreator ..> MenuItemFactory : use
MenuItemCreator ..> MenuEventPublisher : use

MenuItemUpdater ..> IMenuItemRepository : use
MenuItemUpdater ..> MenuEventPublisher : use

MenuItemDeleter ..> IMenuItemRepository : use
MenuItemDeleter ..> MenuEventPublisher : use

MenuAvailabilityManager ..> IMenuItemRepository : use
MenuAvailabilityManager ..> IAvailabilityCache : use
MenuAvailabilityManager ..> MenuEventPublisher : use

PromotionCreator ..> IPromotionRepository : use
PromotionCreator ..> PromotionValidator : use
PromotionCreator ..> PromotionEventPublisher : use

PromotionUpdater ..> IPromotionRepository : use
PromotionUpdater ..> PromotionEventPublisher : use

PromotionRetriever ..> IPromotionRepository : use

PromotionDeleter ..> IPromotionRepository : use
PromotionDeleter ..> PromotionEventPublisher : use

SessionValidator ..> ITableServiceClient : use
OrderValidator ..> MenuAvailabilityManager : use

%% =========================
%% DOMAIN RELATIONSHIPS
%% =========================
OrderSession "1" _-- "_" Order : accumulates
Order "1" _-- "1.._" OrderItem : contains
MenuItem "\*" --> "1" MenuCategory : belongs to

OrderSession ..> Money : uses
OrderSession ..> AllergyTag : tracks
Order ..> Money : uses
OrderItem ..> Money : uses
OrderItem ..> AllergyTag : carries
MenuItem ..> Money : uses
MenuItem ..> AllergyTag : declares
Promotion ..> Money : uses

%% =========================
%% REPOSITORIES -> DOMAIN
%% =========================
IOrderSessionRepository ..> OrderSession
IOrderRepository ..> Order
IMenuItemRepository ..> MenuItem
IMenuCategoryRepository ..> MenuCategory
IPromotionRepository ..> Promotion
