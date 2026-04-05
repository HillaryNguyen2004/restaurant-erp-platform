classDiagram
direction TB

%% =========================
%% PRESENTATION LAYER
%% =========================
class InventoryFacade {
  <<Facade>>
  +getStockLevels() StockLevelDto[*]
  +deductStock(req: DeductStockRequest) void
  +logWaste(req: LogWasteRequest) void
  +getAlerts() StockAlertDto[*]
  +generateReorderReport() ReorderReportDto
}

class IngredientController {
  <<Controller>>
  +createIngredient(req: CreateIngredientRequest) IngredientDto
  +updateIngredient(id: UUID, req: UpdateIngredientRequest) IngredientDto
  +deleteIngredient(id: UUID) void
  +getIngredient(id: UUID) IngredientDto
  +getAllIngredients() IngredientDto[*]
}

class StockController {
  <<Controller>>
  +getStockLevel(ingredientId: UUID) StockLevelDto
  +getAllStockLevels() StockLevelDto[*]
  +adjustStock(req: AdjustStockRequest) StockLevelDto
  +getStockHistory(ingredientId: UUID) StockTransactionDto[*]
}

class WasteController {
  <<Controller>>
  +logWaste(req: LogWasteRequest) WasteLogDto
  +getWasteLogs(period: DateRange) WasteLogDto[*]
  +getWastageReport(period: DateRange) WastageReportDto
}

class AlertController {
  <<Controller>>
  +getActiveAlerts() StockAlertDto[*]
  +acknowledgeAlert(alertId: UUID) void
  +configureThreshold(ingredientId: UUID, threshold: Decimal) void
}

class ProcurementController {
  <<Controller>>
  +createPurchaseOrder(req: CreatePurchaseOrderRequest) PurchaseOrderDto
  +receivePurchaseOrder(poId: UUID, req: ReceiveGoodsRequest) void
  +getPurchaseOrderHistory() PurchaseOrderDto[*]
  +getPredictiveReorderSuggestions() ReorderSuggestionDto[*]
}

class InventoryAuthMiddleware {
  <<Middleware>>
  +authenticate(token: String) AuthContext
  +authorize(ctx: AuthContext, action: String) bool
}

class CreateIngredientRequest {
  +name: String
  +unit: String
  +costPerUnit: Decimal
  +category: String
  +minThreshold: Decimal
}

class UpdateIngredientRequest {
  +name: String
  +costPerUnit: Decimal
  +minThreshold: Decimal
  +isActive: bool
}

class DeductStockRequest {
  +ingredientId: UUID
  +quantity: Decimal
  +reason: String
  +orderId: UUID
}

class AdjustStockRequest {
  +ingredientId: UUID
  +quantity: Decimal
  +adjustmentType: AdjustmentType
  +reason: String
  +performedBy: UUID
}

class LogWasteRequest {
  +ingredientId: UUID
  +quantity: Decimal
  +reason: WasteReason
  +loggedBy: UUID
}

class CreatePurchaseOrderRequest {
  +supplierId: UUID
  +items: POItemData[*]
  +expectedDelivery: DateTime
  +createdBy: UUID
}

class ReceiveGoodsRequest {
  +receivedItems: ReceivedItemData[*]
  +receivedBy: UUID
  +receivedAt: DateTime
}

class IngredientDto {
  +id: UUID
  +name: String
  +unit: String
  +costPerUnit: Decimal
  +category: String
  +currentStock: Decimal
  +minThreshold: Decimal
}

class StockLevelDto {
  +ingredientId: UUID
  +ingredientName: String
  +currentQuantity: Decimal
  +unit: String
  +minThreshold: Decimal
  +status: StockStatus
  +lastUpdated: DateTime
}

class WasteLogDto {
  +id: UUID
  +ingredientId: UUID
  +ingredientName: String
  +quantity: Decimal
  +reason: WasteReason
  +value: Decimal
  +loggedBy: UUID
  +loggedAt: DateTime
}

class StockAlertDto {
  +alertId: UUID
  +ingredientId: UUID
  +ingredientName: String
  +currentLevel: Decimal
  +threshold: Decimal
  +severity: AlertSeverity
  +createdAt: DateTime
}

class PurchaseOrderDto {
  +id: UUID
  +poNumber: String
  +supplierId: UUID
  +items: POItemDto[*]
  +totalCost: Decimal
  +status: POStatus
  +createdAt: DateTime
}

class POItemDto {
  +ingredientId: UUID
  +ingredientName: String
  +orderedQuantity: Decimal
  +receivedQuantity: Decimal
  +unitCost: Decimal
}

class ReorderSuggestionDto {
  +ingredientId: UUID
  +ingredientName: String
  +currentStock: Decimal
  +suggestedQuantity: Decimal
  +estimatedCost: Decimal
  +urgency: UrgencyLevel
}

class WastageReportDto {
  +period: DateRange
  +totalWaste: Decimal
  +wasteByCategory: WasteCategoryData[*]
  +topWastedItems: WasteItemData[*]
}

class ReorderReportDto {
  +generatedAt: DateTime
  +suggestions: ReorderSuggestionDto[*]
  +totalEstimatedCost: Decimal
}

class StockTransactionDto {
  +id: UUID
  +ingredientId: UUID
  +transactionType: TransactionType
  +quantity: Decimal
  +balance: Decimal
  +reference: String
  +timestamp: DateTime
}

%% =========================
%% APPLICATION LAYER
%% =========================
class StockManagementService {
  <<interface>>
  +getStockLevel(ingredientId: UUID) StockLevel
  +getAllStockLevels() StockLevel[*]
  +adjustStock(cmd: AdjustStockCommand) StockLevel
  +getStockHistory(ingredientId: UUID) StockTransaction[*]
}

class StockDeductionService {
  <<interface>>
  +deductStock(cmd: DeductStockCommand) void
  +deductByRecipe(menuItemId: UUID, quantity: int, orderId: UUID) void
  +bulkDeduct(deductions: StockDeduction[*]) void
}

class WastageTrackingService {
  <<interface>>
  +logWaste(cmd: LogWasteCommand) WasteLog
  +getWasteLogs(period: DateRange) WasteLog[*]
  +generateWastageReport(period: DateRange) WastageReport
}

class AlertService {
  <<interface>>
  +checkThresholds() StockAlert[*]
  +createAlert(alert: StockAlert) void
  +acknowledgeAlert(alertId: UUID) void
  +getActiveAlerts() StockAlert[*]
}

class PredictiveReorderService {
  <<interface>>
  +generateReorderSuggestions() ReorderSuggestion[*]
  +predictUsage(ingredientId: UUID, period: DateRange) UsagePrediction
  +optimizeOrderQuantity(ingredientId: UUID) Decimal
}

class COGSAnalysisService {
  <<interface>>
  +calculateCOGS(menuItemId: UUID, quantity: int) Money
  +getIngredientCost(ingredientId: UUID) Money
  +generateCOGSReport(period: DateRange) COGSReport
}

class ProcurementService {
  <<interface>>
  +createPurchaseOrder(cmd: CreatePurchaseOrderCommand) PurchaseOrder
  +receivePurchaseOrder(poId: UUID, cmd: ReceiveGoodsCommand) void
  +getPurchaseOrderHistory() PurchaseOrder[*]
}

class IngredientManagementService {
  <<interface>>
  +createIngredient(cmd: CreateIngredientCommand) Ingredient
  +updateIngredient(cmd: UpdateIngredientCommand) Ingredient
  +deleteIngredient(ingredientId: UUID) void
  +getIngredient(ingredientId: UUID) Ingredient
}

class InventoryEventIngestionService {
  <<interface>>
  +handleOrderCreated(event: OrderCreatedEvent) void
  +handleOrderCancelled(event: OrderCancelledEvent) void
  +handleRecipeUpdated(event: RecipeUpdatedEvent) void
}

class InventoryEventPublishingService {
  <<interface>>
  +publishStockDepleted(ingredient: Ingredient) void
  +publishWasteLogged(wasteLog: WasteLog) void
  +publishStockAdjusted(transaction: StockTransaction) void
}

class StockManagementServiceImpl {
  -stockRepository: IStockLevelRepository
  -transactionRepository: IStockTransactionRepository
  -ingredientRepository: IIngredientRepository
  +getStockLevel(ingredientId: UUID) StockLevel
  +adjustStock(cmd: AdjustStockCommand) StockLevel
}

class StockDeductionServiceImpl {
  -stockRepository: IStockLevelRepository
  -recipeRepository: IRecipeRepository
  -transactionRepository: IStockTransactionRepository
  -deductionPolicy: StockDeductionPolicy
  -alertService: AlertService
  -eventPublisher: InventoryEventPublishingService
  +deductStock(cmd: DeductStockCommand) void
  +deductByRecipe(menuItemId: UUID, quantity: int, orderId: UUID) void
}

class WastageTrackingServiceImpl {
  -wasteRepository: IWasteLogRepository
  -stockRepository: IStockLevelRepository
  -costCalculator: WasteCostCalculator
  -eventPublisher: InventoryEventPublishingService
  +logWaste(cmd: LogWasteCommand) WasteLog
  +generateWastageReport(period: DateRange) WastageReport
}

class AlertServiceImpl {
  -alertRepository: IStockAlertRepository
  -stockRepository: IStockLevelRepository
  -thresholdPolicy: ThresholdAlertPolicy
  -notificationStrategy: IAlertNotificationStrategy
  +checkThresholds() StockAlert[*]
  +createAlert(alert: StockAlert) void
}

class PredictiveReorderServiceImpl {
  -stockRepository: IStockLevelRepository
  -transactionRepository: IStockTransactionRepository
  -usageAnalyzer: UsageAnalyzer
  -reorderCalculator: ReorderCalculator
  +generateReorderSuggestions() ReorderSuggestion[*]
  +predictUsage(ingredientId: UUID, period: DateRange) UsagePrediction
}

class COGSAnalysisServiceImpl {
  -recipeRepository: IRecipeRepository
  -ingredientRepository: IIngredientRepository
  -costCalculator: COGSCalculator
  +calculateCOGS(menuItemId: UUID, quantity: int) Money
  +generateCOGSReport(period: DateRange) COGSReport
}

class ProcurementServiceImpl {
  -poRepository: IPurchaseOrderRepository
  -stockRepository: IStockLevelRepository
  -eventPublisher: InventoryEventPublishingService
  +createPurchaseOrder(cmd: CreatePurchaseOrderCommand) PurchaseOrder
  +receivePurchaseOrder(poId: UUID, cmd: ReceiveGoodsCommand) void
}

class IngredientManagementServiceImpl {
  -ingredientRepository: IIngredientRepository
  -stockRepository: IStockLevelRepository
  -ingredientFactory: IngredientFactory
  +createIngredient(cmd: CreateIngredientCommand) Ingredient
  +updateIngredient(cmd: UpdateIngredientCommand) Ingredient
}

class InventoryEventIngestionServiceImpl {
  -deductionService: StockDeductionService
  -recipeRepository: IRecipeRepository
  +handleOrderCreated(event: OrderCreatedEvent) void
  +handleOrderCancelled(event: OrderCancelledEvent) void
  +handleRecipeUpdated(event: RecipeUpdatedEvent) void
}

class InventoryEventPublishingServiceImpl {
  -eventPublisher: IDomainEventPublisher
  +publishStockDepleted(ingredient: Ingredient) void
  +publishWasteLogged(wasteLog: WasteLog) void
  +publishStockAdjusted(transaction: StockTransaction) void
}

class DeductStockCommand {
  +ingredientId: UUID
  +quantity: Decimal
  +reason: String
  +orderId: UUID
  +performedBy: UUID
}

class AdjustStockCommand {
  +ingredientId: UUID
  +quantity: Decimal
  +adjustmentType: AdjustmentType
  +reason: String
  +performedBy: UUID
}

class LogWasteCommand {
  +ingredientId: UUID
  +quantity: Decimal
  +reason: WasteReason
  +loggedBy: UUID
}

class CreateIngredientCommand {
  +name: String
  +unit: String
  +costPerUnit: Decimal
  +category: String
  +minThreshold: Decimal
  +createdBy: UUID
}

class UpdateIngredientCommand {
  +ingredientId: UUID
  +name: String
  +costPerUnit: Decimal
  +minThreshold: Decimal
  +isActive: bool
  +updatedBy: UUID
}

class CreatePurchaseOrderCommand {
  +supplierId: UUID
  +items: POItemData[*]
  +expectedDelivery: DateTime
  +createdBy: UUID
}

class ReceiveGoodsCommand {
  +poId: UUID
  +receivedItems: ReceivedItemData[*]
  +receivedBy: UUID
  +receivedAt: DateTime
}

%% =========================
%% DOMAIN LAYER
%% =========================
class Ingredient {
  +id: UUID
  +name: String
  +unit: String
  +costPerUnit: Money
  +category: String
  +minThreshold: Decimal
  +isActive: bool
  +updateCost(newCost: Money) void
  +updateThreshold(threshold: Decimal) void
}

class StockLevel {
  +ingredientId: UUID
  +currentQuantity: Decimal
  +unit: String
  +lastUpdated: DateTime
  +status: StockStatus
  +deduct(quantity: Decimal) void
  +add(quantity: Decimal) void
  +isBelowThreshold(threshold: Decimal) bool
  +calculateValue(costPerUnit: Money) Money
}

class Recipe {
  +menuItemId: UUID
  +ingredients: RecipeIngredient[*]
  +yield: int
  +calculateTotalCost(ingredientCosts: Map) Money
  +getRequiredStock(quantity: int) StockDeduction[*]
}

class RecipeIngredient {
  <<ValueObject>>
  +ingredientId: UUID
  +quantity: Decimal
  +unit: String
  +calculateForQuantity(multiplier: int) Decimal
}

class StockTransaction {
  +id: UUID
  +ingredientId: UUID
  +transactionType: TransactionType
  +quantity: Decimal
  +balanceAfter: Decimal
  +reference: String
  +performedBy: UUID
  +timestamp: DateTime
}

class WasteLog {
  +id: UUID
  +ingredientId: UUID
  +quantity: Decimal
  +unit: String
  +reason: WasteReason
  +value: Money
  +loggedBy: UUID
  +loggedAt: DateTime
}

class StockAlert {
  +id: UUID
  +ingredientId: UUID
  +currentLevel: Decimal
  +threshold: Decimal
  +severity: AlertSeverity
  +isAcknowledged: bool
  +createdAt: DateTime
  +acknowledge() void
}

class PurchaseOrder {
  <<AggregateRoot>>
  +id: UUID
  +poNumber: String
  +supplierId: UUID
  +items: POItem[*]
  +totalCost: Money
  +status: POStatus
  +expectedDelivery: DateTime
  +createdAt: DateTime
  +addItem(item: POItem) void
  +receive(receivedItems: ReceivedItem[*]) void
  +calculateTotal() Money
}

class POItem {
  +ingredientId: UUID
  +orderedQuantity: Decimal
  +receivedQuantity: Decimal
  +unitCost: Money
  +calculateSubtotal() Money
}

class ReceivedItem {
  <<ValueObject>>
  +ingredientId: UUID
  +quantity: Decimal
  +condition: String
}

class ReorderSuggestion {
  +ingredientId: UUID
  +currentStock: Decimal
  +suggestedQuantity: Decimal
  +estimatedCost: Money
  +urgency: UrgencyLevel
  +basedOnDays: int
}

class UsagePrediction {
  +ingredientId: UUID
  +predictedUsage: Decimal
  +period: DateRange
  +confidence: Decimal
}

class StockDeduction {
  <<ValueObject>>
  +ingredientId: UUID
  +quantity: Decimal
  +orderId: UUID
}

class WastageReport {
  +period: DateRange
  +totalWaste: Money
  +wasteByCategory: Map
  +topWastedItems: WasteItemData[*]
}

class COGSReport {
  +period: DateRange
  +totalCOGS: Money
  +byMenuItem: Map
  +margins: Map
}

class StockStatus {
  <<enumeration>>
  SUFFICIENT
  LOW
  CRITICAL
  OUT_OF_STOCK
}

class TransactionType {
  <<enumeration>>
  PURCHASE
  DEDUCTION
  ADJUSTMENT
  WASTE
  RETURN
}

class WasteReason {
  <<enumeration>>
  SPOILAGE
  EXPIRATION
  DAMAGE
  SPILLAGE
  PREPARATION_ERROR
  OTHER
}

class AdjustmentType {
  <<enumeration>>
  INCREASE
  DECREASE
  CORRECTION
}

class POStatus {
  <<enumeration>>
  DRAFT
  SUBMITTED
  APPROVED
  RECEIVED
  CANCELLED
}

class UrgencyLevel {
  <<enumeration>>
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

class AlertSeverity {
  <<enumeration>>
  INFO
  WARNING
  CRITICAL
}

class Money {
  <<ValueObject>>
  +amount: Decimal
  +currency: String
  +add(other: Money) Money
  +subtract(other: Money) Money
  +multiply(factor: Decimal) Money
}

class IngredientFactory {
  <<Factory>>
  +createIngredient(cmd: CreateIngredientCommand) Ingredient
}

class StockDeductionPolicy {
  <<Policy>>
  +canDeduct(stockLevel: StockLevel, quantity: Decimal) bool
  +validateDeduction(deduction: StockDeduction) ValidationResult
}

class ThresholdAlertPolicy {
  <<Policy>>
  +shouldCreateAlert(stockLevel: StockLevel, threshold: Decimal) bool
  +determineSeverity(stockLevel: StockLevel, threshold: Decimal) AlertSeverity
}

class COGSCalculator {
  <<DomainService>>
  +calculateRecipeCost(recipe: Recipe, ingredientCosts: Map) Money
  +calculateMenuItemCOGS(menuItemId: UUID, quantity: int) Money
}

class WasteCostCalculator {
  <<DomainService>>
  +calculateWasteValue(waste: WasteLog, costPerUnit: Money) Money
}

class UsageAnalyzer {
  <<DomainService>>
  +analyzeHistoricalUsage(ingredientId: UUID, period: DateRange) UsagePattern
  +predictFutureUsage(pattern: UsagePattern, forecastDays: int) UsagePrediction
}

class ReorderCalculator {
  <<DomainService>>
  +calculateReorderQuantity(ingredient: Ingredient, prediction: UsagePrediction) Decimal
  +optimizeOrderSize(ingredient: Ingredient, constraints: OrderConstraints) Decimal
}

class StockDepletedEvent {
  +ingredientId: UUID
  +ingredientName: String
  +timestamp: DateTime
}

class WasteLoggedEvent {
  +wasteLogId: UUID
  +ingredientId: UUID
  +quantity: Decimal
  +value: Money
  +timestamp: DateTime
}

class StockAdjustedEvent {
  +transactionId: UUID
  +ingredientId: UUID
  +quantity: Decimal
  +adjustmentType: AdjustmentType
  +timestamp: DateTime
}

class OrderCreatedEvent {
  +orderId: UUID
  +items: OrderItemData[*]
  +timestamp: DateTime
}

class OrderCancelledEvent {
  +orderId: UUID
  +reason: String
  +timestamp: DateTime
}

class RecipeUpdatedEvent {
  +menuItemId: UUID
  +ingredients: RecipeIngredientData[*]
  +timestamp: DateTime
}

%% =========================
%% INFRASTRUCTURE LAYER
%% =========================
class IIngredientRepository {
  <<interface>>
  +findById(id: UUID) Ingredient
  +findAll() Ingredient[*]
  +findByCategory(category: String) Ingredient[*]
  +save(ingredient: Ingredient) Ingredient
  +delete(id: UUID) void
}

class IStockLevelRepository {
  <<interface>>
  +findByIngredientId(ingredientId: UUID) StockLevel
  +findAll() StockLevel[*]
  +findBelowThreshold() StockLevel[*]
  +save(stockLevel: StockLevel) StockLevel
}

class IRecipeRepository {
  <<interface>>
  +findByMenuItemId(menuItemId: UUID) Recipe
  +findAll() Recipe[*]
}

class IStockTransactionRepository {
  <<interface>>
  +findByIngredientId(ingredientId: UUID) StockTransaction[*]
  +findByPeriod(period: DateRange) StockTransaction[*]
  +save(transaction: StockTransaction) StockTransaction
}

class IWasteLogRepository {
  <<interface>>
  +findById(id: UUID) WasteLog
  +findByPeriod(period: DateRange) WasteLog[*]
  +findByIngredient(ingredientId: UUID) WasteLog[*]
  +save(wasteLog: WasteLog) WasteLog
}

class IStockAlertRepository {
  <<interface>>
  +findById(id: UUID) StockAlert
  +findActive() StockAlert[*]
  +save(alert: StockAlert) StockAlert
}

class IPurchaseOrderRepository {
  <<interface>>
  +findById(id: UUID) PurchaseOrder
  +findByStatus(status: POStatus) PurchaseOrder[*]
  +save(po: PurchaseOrder) PurchaseOrder
}

class IAlertNotificationStrategy {
  <<Strategy>>
  +notify(alert: StockAlert) void
}

class IDomainEventPublisher {
  <<Publisher>>
  +publish(eventName: String, payload: Object) void
}

class SqlIngredientRepository {
  <<Repository>>
}

class SqlStockLevelRepository {
  <<Repository>>
}

class SqlRecipeRepository {
  <<Repository>>
  -Note: Read-only, synced from Menu Module
}

class SqlStockTransactionRepository {
  <<Repository>>
}

class SqlWasteLogRepository {
  <<Repository>>
}

class SqlStockAlertRepository {
  <<Repository>>
}

class SqlPurchaseOrderRepository {
  <<Repository>>
}

class EmailAlertNotificationStrategy {
  <<StrategyImpl>>
  +notify(alert: StockAlert) void
}

class EventBusPublisherAdapter {
  <<Adapter>>
  +publish(eventName: String, payload: Object) void
}

%% =========================
%% MAIN RELATIONS
%% =========================
InventoryFacade --> IngredientController
InventoryFacade --> StockController
InventoryFacade --> WasteController
InventoryFacade --> AlertController
InventoryFacade --> ProcurementController

IngredientController --> IngredientManagementService
StockController --> StockManagementService
WasteController --> WastageTrackingService
AlertController --> AlertService
ProcurementController --> ProcurementService
ProcurementController --> PredictiveReorderService

StockManagementService <|.. StockManagementServiceImpl
StockDeductionService <|.. StockDeductionServiceImpl
WastageTrackingService <|.. WastageTrackingServiceImpl
AlertService <|.. AlertServiceImpl
PredictiveReorderService <|.. PredictiveReorderServiceImpl
COGSAnalysisService <|.. COGSAnalysisServiceImpl
ProcurementService <|.. ProcurementServiceImpl
IngredientManagementService <|.. IngredientManagementServiceImpl
InventoryEventIngestionService <|.. InventoryEventIngestionServiceImpl
InventoryEventPublishingService <|.. InventoryEventPublishingServiceImpl

StockManagementServiceImpl --> IStockLevelRepository
StockManagementServiceImpl --> IIngredientRepository
StockManagementServiceImpl --> IStockTransactionRepository

StockDeductionServiceImpl --> IStockLevelRepository
StockDeductionServiceImpl --> IRecipeRepository
StockDeductionServiceImpl --> IStockTransactionRepository
StockDeductionServiceImpl --> StockDeductionPolicy
StockDeductionServiceImpl --> AlertService
StockDeductionServiceImpl --> InventoryEventPublishingService

WastageTrackingServiceImpl --> IWasteLogRepository
WastageTrackingServiceImpl --> IStockLevelRepository
WastageTrackingServiceImpl --> WasteCostCalculator
WastageTrackingServiceImpl --> InventoryEventPublishingService

AlertServiceImpl --> IStockAlertRepository
AlertServiceImpl --> IStockLevelRepository
AlertServiceImpl --> ThresholdAlertPolicy
AlertServiceImpl --> IAlertNotificationStrategy

PredictiveReorderServiceImpl --> IStockLevelRepository
PredictiveReorderServiceImpl --> IStockTransactionRepository
PredictiveReorderServiceImpl --> UsageAnalyzer
PredictiveReorderServiceImpl --> ReorderCalculator

COGSAnalysisServiceImpl --> IRecipeRepository
COGSAnalysisServiceImpl --> IIngredientRepository
COGSAnalysisServiceImpl --> COGSCalculator

ProcurementServiceImpl --> IPurchaseOrderRepository
ProcurementServiceImpl --> IStockLevelRepository
ProcurementServiceImpl --> InventoryEventPublishingService

IngredientManagementServiceImpl --> IIngredientRepository
IngredientManagementServiceImpl --> IStockLevelRepository
IngredientManagementServiceImpl --> IngredientFactory

InventoryEventIngestionServiceImpl --> StockDeductionService
InventoryEventIngestionServiceImpl --> IRecipeRepository
InventoryEventIngestionServiceImpl ..> OrderCreatedEvent
InventoryEventIngestionServiceImpl ..> OrderCancelledEvent
InventoryEventIngestionServiceImpl ..> RecipeUpdatedEvent

InventoryEventPublishingServiceImpl --> IDomainEventPublisher

Recipe "1" *-- "*" RecipeIngredient
PurchaseOrder "1" *-- "*" POItem
StockLevel "1" --> "1" Ingredient

IngredientFactory ..> Ingredient
StockDeductionPolicy ..> StockLevel
ThresholdAlertPolicy ..> StockLevel
COGSCalculator ..> Recipe
WasteCostCalculator ..> WasteLog
UsageAnalyzer ..> StockTransaction
ReorderCalculator ..> Ingredient

IIngredientRepository <|.. SqlIngredientRepository
IStockLevelRepository <|.. SqlStockLevelRepository
IRecipeRepository <|.. SqlRecipeRepository
IStockTransactionRepository <|.. SqlStockTransactionRepository
IWasteLogRepository <|.. SqlWasteLogRepository
IStockAlertRepository <|.. SqlStockAlertRepository
IPurchaseOrderRepository <|.. SqlPurchaseOrderRepository
IAlertNotificationStrategy <|.. EmailAlertNotificationStrategy
IDomainEventPublisher <|.. EventBusPublisherAdapter

InventoryEventPublishingServiceImpl --> IDomainEventPublisher