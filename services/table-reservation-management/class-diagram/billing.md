classDiagram
direction TB

%% =========================
%% PRESENTATION LAYER
%% =========================
class BillingFacade {
  <<Facade>>
  +createBill(orderId: UUID) BillDto
  +splitBill(billId: UUID, req: SplitBillRequest) BillDto[*]
  +processPayment(billId: UUID, req: PaymentRequest) PaymentResultDto
  +generateReceipt(billId: UUID) ReceiptDto
  +processRefund(billId: UUID, req: RefundRequest) RefundDto
}

class BillController {
  <<Controller>>
  +createBill(orderId: UUID) BillDto
  +getBillDetails(billId: UUID) BillDetailsDto
  +splitBill(billId: UUID, req: SplitBillRequest) BillDto[*]
  +applyDiscount(billId: UUID, discountCode: String) BillDto
  +voidBill(billId: UUID, reason: String) void
}

class PaymentController {
  <<Controller>>
  +processPayment(billId: UUID, req: PaymentRequest) PaymentResultDto
  +processPartialPayment(billId: UUID, req: PartialPaymentRequest) PaymentResultDto
  +getPaymentHistory(billId: UUID) PaymentDto[*]
}

class ReceiptController {
  <<Controller>>
  +generateReceipt(billId: UUID) ReceiptDto
  +printReceipt(billId: UUID) void
  +emailReceipt(billId: UUID, email: String) void
}

class RefundController {
  <<Controller>>
  +processRefund(billId: UUID, req: RefundRequest) RefundDto
  +getRefundHistory(billId: UUID) RefundDto[*]
}

class TipController {
  <<Controller>>
  +addTip(billId: UUID, req: TipRequest) BillDto
  +distributeTips(staffId: UUID, period: DateRange) TipDistributionDto
}

class BillingAuthMiddleware {
  <<Middleware>>
  +authenticate(token: String) AuthContext
  +authorize(ctx: AuthContext, action: String) bool
}

class SplitBillRequest {
  +splitType: SplitType
  +splits: BillSplitData[*]
}

class BillSplitData {
  +items: UUID[*]
  +percentage: Decimal
  +equalShare: bool
}

class PaymentRequest {
  +paymentMethod: PaymentMethod
  +amount: Decimal
  +tipAmount: Decimal
  +staffId: UUID
  +paymentDetails: PaymentDetails
}

class PartialPaymentRequest {
  +payments: PaymentRequest[*]
}

class RefundRequest {
  +amount: Decimal
  +reason: String
  +items: UUID[*]
  +processedBy: UUID
}

class TipRequest {
  +amount: Decimal
  +tipType: TipType
  +staffId: UUID
}

class BillDto {
  +billId: UUID
  +orderId: UUID
  +billNumber: String
  +subtotal: Decimal
  +tax: Decimal
  +serviceCharge: Decimal
  +discount: Decimal
  +total: Decimal
  +status: BillStatus
}

class BillDetailsDto {
  +billId: UUID
  +billNumber: String
  +items: BillItemDto[*]
  +subtotal: Decimal
  +taxes: TaxDto[*]
  +serviceCharge: Decimal
  +discounts: DiscountDto[*]
  +total: Decimal
  +payments: PaymentDto[*]
  +status: BillStatus
}

class BillItemDto {
  +itemId: UUID
  +name: String
  +quantity: int
  +unitPrice: Decimal
  +subtotal: Decimal
}

class PaymentDto {
  +paymentId: UUID
  +method: PaymentMethod
  +amount: Decimal
  +tip: Decimal
  +processedAt: DateTime
  +status: PaymentStatus
}

class PaymentResultDto {
  +success: bool
  +transactionId: String
  +message: String
  +remainingBalance: Decimal
}

class ReceiptDto {
  +receiptId: UUID
  +receiptNumber: String
  +billDetails: BillDetailsDto
  +payments: PaymentDto[*]
  +generatedAt: DateTime
  +format: String
}

class RefundDto {
  +refundId: UUID
  +billId: UUID
  +amount: Decimal
  +reason: String
  +processedBy: UUID
  +processedAt: DateTime
}

class TipDistributionDto {
  +staffId: UUID
  +period: DateRange
  +totalTips: Decimal
  +breakdown: TipBreakdown[*]
}

class TaxDto {
  +name: String
  +rate: Decimal
  +amount: Decimal
}

class DiscountDto {
  +code: String
  +description: String
  +amount: Decimal
  +type: DiscountType
}

%% =========================
%% APPLICATION LAYER
%% =========================
class BillCalculationService {
  <<interface>>
  +createBill(cmd: CreateBillCommand) Bill
  +calculateTotal(bill: Bill) Money
  +applyDiscount(billId: UUID, discountCode: String) Bill
  +applyTax(bill: Bill) Bill
}

class BillSplitService {
  <<interface>>
  +splitByItems(billId: UUID, splits: ItemSplit[*]) Bill[*]
  +splitEqually(billId: UUID, numberOfSplits: int) Bill[*]
  +splitByPercentage(billId: UUID, splits: PercentageSplit[*]) Bill[*]
}

class PaymentProcessingService {
  <<interface>>
  +processPayment(cmd: ProcessPaymentCommand) PaymentResult
  +processPartialPayment(cmd: ProcessPartialPaymentCommand) PaymentResult
  +validatePayment(payment: Payment) ValidationResult
}

class ReceiptGenerationService {
  <<interface>>
  +generateReceipt(billId: UUID) Receipt
  +printReceipt(receiptId: UUID) void
  +emailReceipt(receiptId: UUID, email: String) void
}

class RefundService {
  <<interface>>
  +processRefund(cmd: ProcessRefundCommand) Refund
  +validateRefund(refund: Refund) ValidationResult
}

class TipDistributionService {
  <<interface>>
  +addTip(billId: UUID, tip: Tip) void
  +distributeTips(staffId: UUID, period: DateRange) TipDistribution
  +calculatePooledTips(period: DateRange) PooledTips
}

class DiscountValidationService {
  <<interface>>
  +validateDiscount(code: String, bill: Bill) ValidationResult
  +applyDiscount(discount: Discount, bill: Bill) Bill
}

class BillingEventPublishingService {
  <<interface>>
  +publishBillCreated(bill: Bill) void
  +publishPaymentProcessed(payment: Payment) void
  +publishRefundProcessed(refund: Refund) void
}

class BillCalculationServiceImpl {
  -billRepository: IBillRepository
  -taxCalculator: TaxCalculator
  -discountCalculator: DiscountCalculator
  -billFactory: BillFactory
  +createBill(cmd: CreateBillCommand) Bill
  +calculateTotal(bill: Bill) Money
  +applyTax(bill: Bill) Bill
}

class BillSplitServiceImpl {
  -billRepository: IBillRepository
  -billFactory: BillFactory
  -splitStrategy: IBillSplitStrategy
  +splitByItems(billId: UUID, splits: ItemSplit[*]) Bill[*]
  +splitEqually(billId: UUID, numberOfSplits: int) Bill[*]
}

class PaymentProcessingServiceImpl {
  -paymentRepository: IPaymentRepository
  -billRepository: IBillRepository
  -paymentGateway: IPaymentGateway
  -paymentValidator: PaymentValidator
  -eventPublisher: BillingEventPublishingService
  +processPayment(cmd: ProcessPaymentCommand) PaymentResult
  +processPartialPayment(cmd: ProcessPartialPaymentCommand) PaymentResult
}

class ReceiptGenerationServiceImpl {
  -receiptRepository: IReceiptRepository
  -billRepository: IBillRepository
  -receiptFormatter: IReceiptFormatter
  -receiptPrinter: IReceiptPrinter
  +generateReceipt(billId: UUID) Receipt
  +printReceipt(receiptId: UUID) void
}

class RefundServiceImpl {
  -refundRepository: IRefundRepository
  -billRepository: IBillRepository
  -auditLogger: IAuditLogger
  -eventPublisher: BillingEventPublishingService
  +processRefund(cmd: ProcessRefundCommand) Refund
}

class TipDistributionServiceImpl {
  -tipRepository: ITipRepository
  -distributionStrategy: ITipDistributionStrategy
  +addTip(billId: UUID, tip: Tip) void
  +distributeTips(staffId: UUID, period: DateRange) TipDistribution
}

class DiscountValidationServiceImpl {
  -discountRepository: IDiscountRepository
  -promotionRepository: IPromotionRepository
  +validateDiscount(code: String, bill: Bill) ValidationResult
  +applyDiscount(discount: Discount, bill: Bill) Bill
}

class BillingEventPublishingServiceImpl {
  -eventPublisher: IDomainEventPublisher
  +publishBillCreated(bill: Bill) void
  +publishPaymentProcessed(payment: Payment) void
}

class CreateBillCommand {
  +orderId: UUID
  +items: BillItemData[*]
  +createdBy: UUID
}

class ProcessPaymentCommand {
  +billId: UUID
  +paymentMethod: PaymentMethod
  +amount: Decimal
  +tipAmount: Decimal
  +staffId: UUID
  +paymentDetails: PaymentDetails
}

class ProcessRefundCommand {
  +billId: UUID
  +amount: Decimal
  +reason: String
  +items: UUID[*]
  +processedBy: UUID
}

%% =========================
%% DOMAIN LAYER
%% =========================
class Bill {
  <<AggregateRoot>>
  +id: UUID
  +billNumber: String
  +orderId: UUID
  +items: BillItem[*]
  +subtotal: Money
  +taxes: Tax[*]
  +serviceCharge: Money
  +discounts: Discount[*]
  +total: Money
  +status: BillStatus
  +createdAt: DateTime
  +addItem(item: BillItem) void
  +applyTax(tax: Tax) void
  +applyDiscount(discount: Discount) void
  +calculateTotal() Money
  +markPaid() void
  +void(reason: String) void
}

class BillItem {
  +id: UUID
  +menuItemId: UUID
  +name: String
  +quantity: int
  +unitPrice: Money
  +calculateSubtotal() Money
}

class Payment {
  <<AggregateRoot>>
  +id: UUID
  +billId: UUID
  +paymentMethod: PaymentMethod
  +amount: Money
  +tip: Tip
  +transactionId: String
  +status: PaymentStatus
  +processedAt: DateTime
  +processedBy: UUID
  +process() PaymentResult
  +cancel() void
}

class Refund {
  +id: UUID
  +billId: UUID
  +paymentId: UUID
  +amount: Money
  +reason: String
  +items: UUID[*]
  +processedBy: UUID
  +processedAt: DateTime
  +status: RefundStatus
}

class Receipt {
  +id: UUID
  +receiptNumber: String
  +billId: UUID
  +bill: Bill
  +payments: Payment[*]
  +generatedAt: DateTime
  +format(formatter: IReceiptFormatter) String
}

class Tax {
  <<ValueObject>>
  +name: String
  +rate: Decimal
  +amount: Money
  +calculate(subtotal: Money) Money
}

class Discount {
  <<ValueObject>>
  +code: String
  +description: String
  +discountType: DiscountType
  +value: Decimal
  +calculate(amount: Money) Money
}

class Tip {
  <<ValueObject>>
  +amount: Money
  +tipType: TipType
  +staffId: UUID
}

class PaymentDetails {
  <<ValueObject>>
  +cardNumber: String
  +qrCode: String
  +transactionRef: String
}

class TipDistribution {
  +staffId: UUID
  +period: DateRange
  +totalTips: Money
  +breakdown: TipBreakdown[*]
}

class Money {
  <<ValueObject>>
  +amount: Decimal
  +currency: String
  +add(other: Money) Money
  +subtract(other: Money) Money
  +multiply(factor: Decimal) Money
}

class BillStatus {
  <<enumeration>>
  PENDING
  PARTIALLY_PAID
  PAID
  REFUNDED
  VOIDED
}

class PaymentStatus {
  <<enumeration>>
  PENDING
  PROCESSING
  COMPLETED
  FAILED
  CANCELLED
}

class PaymentMethod {
  <<enumeration>>
  CASH
  CREDIT_CARD
  DEBIT_CARD
  QR_CODE
  BANK_TRANSFER
}

class RefundStatus {
  <<enumeration>>
  PENDING
  APPROVED
  COMPLETED
  REJECTED
}

class SplitType {
  <<enumeration>>
  BY_ITEM
  EQUAL
  BY_PERCENTAGE
  CUSTOM
}

class TipType {
  <<enumeration>>
  INDIVIDUAL
  POOLED
  PERCENTAGE
  FIXED
}

class DiscountType {
  <<enumeration>>
  PERCENTAGE
  FIXED_AMOUNT
  BUY_X_GET_Y
}

class BillFactory {
  <<Factory>>
  +createBill(cmd: CreateBillCommand, items: BillItem[*]) Bill
  +createSplitBill(original: Bill, items: BillItem[*]) Bill
}

class TaxCalculator {
  <<DomainService>>
  +calculateTax(subtotal: Money, taxRates: TaxRate[*]) Tax[*]
  +getTotalTax(taxes: Tax[*]) Money
}

class DiscountCalculator {
  <<DomainService>>
  +calculateDiscount(discount: Discount, amount: Money) Money
  +applyMultipleDiscounts(discounts: Discount[*], amount: Money) Money
}

class PaymentValidator {
  <<DomainService>>
  +validatePayment(payment: Payment, bill: Bill) ValidationResult
  +validatePartialPayment(payments: Payment[*], bill: Bill) ValidationResult
}

class BillCreatedEvent {
  +billId: UUID
  +orderId: UUID
  +total: Money
  +timestamp: DateTime
}

class PaymentProcessedEvent {
  +paymentId: UUID
  +billId: UUID
  +amount: Money
  +method: PaymentMethod
  +timestamp: DateTime
}

class RefundProcessedEvent {
  +refundId: UUID
  +billId: UUID
  +amount: Money
  +reason: String
  +timestamp: DateTime
}

%% =========================
%% INFRASTRUCTURE LAYER
%% =========================
class IBillRepository {
  <<interface>>
  +findById(id: UUID) Bill
  +findByOrderId(orderId: UUID) Bill
  +save(bill: Bill) Bill
  +delete(id: UUID) void
}

class IPaymentRepository {
  <<interface>>
  +findById(id: UUID) Payment
  +findByBillId(billId: UUID) Payment[*]
  +save(payment: Payment) Payment
}

class IReceiptRepository {
  <<interface>>
  +findById(id: UUID) Receipt
  +findByBillId(billId: UUID) Receipt
  +save(receipt: Receipt) Receipt
}

class IRefundRepository {
  <<interface>>
  +findById(id: UUID) Refund
  +findByBillId(billId: UUID) Refund[*]
  +save(refund: Refund) Refund
}

class ITipRepository {
  <<interface>>
  +findByStaffId(staffId: UUID, period: DateRange) Tip[*]
  +save(tip: Tip) Tip
}

class IDiscountRepository {
  <<interface>>
  +findByCode(code: String) Discount
  +findActive() Discount[*]
}

class IPaymentGateway {
  <<interface>>
  +processPayment(payment: Payment) PaymentResult
  +refundPayment(payment: Payment, amount: Money) RefundResult
}

class IReceiptFormatter {
  <<Strategy>>
  +format(receipt: Receipt) String
}

class IReceiptPrinter {
  <<interface>>
  +print(receipt: Receipt) void
}

class IBillSplitStrategy {
  <<Strategy>>
  +split(bill: Bill, criteria: SplitCriteria) Bill[*]
}

class ITipDistributionStrategy {
  <<Strategy>>
  +distribute(tips: Tip[*], staff: UUID[*]) TipDistribution[*]
}

class IAuditLogger {
  <<interface>>
  +logRefund(refund: Refund) void
  +logVoid(billId: UUID, reason: String) void
  +logCancellation(orderId: UUID, reason: String) void
}

class IDomainEventPublisher {
  <<Publisher>>
  +publish(eventName: String, payload: Object) void
}

class SqlBillRepository {
  <<Repository>>
}

class SqlPaymentRepository {
  <<Repository>>
}

class SqlReceiptRepository {
  <<Repository>>
}

class SqlRefundRepository {
  <<Repository>>
}

class StripePaymentGateway {
  <<GatewayAdapter>>
  +processPayment(payment: Payment) PaymentResult
}

class PdfReceiptFormatter {
  <<FormatterImpl>>
  +format(receipt: Receipt) String
}

class ThermalReceiptPrinter {
  <<PrinterImpl>>
  +print(receipt: Receipt) void
}

class ItemBasedSplitStrategy {
  <<StrategyImpl>>
  +split(bill: Bill, criteria: SplitCriteria) Bill[*]
}

class PooledTipDistributionStrategy {
  <<StrategyImpl>>
  +distribute(tips: Tip[*], staff: UUID[*]) TipDistribution[*]
}

class DatabaseAuditLogger {
  <<LoggerImpl>>
  +logRefund(refund: Refund) void
  +logVoid(billId: UUID, reason: String) void
}

class EventBusPublisherAdapter {
  <<Adapter>>
  +publish(eventName: String, payload: Object) void
}

%% =========================
%% MAIN RELATIONS
%% =========================
BillingFacade --> BillController
BillingFacade --> PaymentController
BillingFacade --> ReceiptController

BillController --> BillCalculationService
BillController --> BillSplitService
PaymentController --> PaymentProcessingService
ReceiptController --> ReceiptGenerationService
RefundController --> RefundService
TipController --> TipDistributionService

BillCalculationService <|.. BillCalculationServiceImpl
BillSplitService <|.. BillSplitServiceImpl
PaymentProcessingService <|.. PaymentProcessingServiceImpl
ReceiptGenerationService <|.. ReceiptGenerationServiceImpl
RefundService <|.. RefundServiceImpl
TipDistributionService <|.. TipDistributionServiceImpl
BillingEventPublishingService <|.. BillingEventPublishingServiceImpl

BillCalculationServiceImpl --> IBillRepository
BillCalculationServiceImpl --> TaxCalculator
BillCalculationServiceImpl --> DiscountCalculator
BillCalculationServiceImpl --> BillFactory

PaymentProcessingServiceImpl --> IPaymentRepository
PaymentProcessingServiceImpl --> IBillRepository
PaymentProcessingServiceImpl --> IPaymentGateway
PaymentProcessingServiceImpl --> PaymentValidator
PaymentProcessingServiceImpl --> BillingEventPublishingService

ReceiptGenerationServiceImpl --> IReceiptRepository
ReceiptGenerationServiceImpl --> IBillRepository
ReceiptGenerationServiceImpl --> IReceiptFormatter
ReceiptGenerationServiceImpl --> IReceiptPrinter

RefundServiceImpl --> IRefundRepository
RefundServiceImpl --> IBillRepository
RefundServiceImpl --> IAuditLogger

BillSplitServiceImpl --> IBillSplitStrategy

Bill "1" *-- "*" BillItem
Bill "1" *-- "*" Tax
Bill "1" *-- "*" Discount
Payment "1" *-- "0..1" Tip
Receipt "1" --> "1" Bill

BillFactory ..> Bill
TaxCalculator ..> Tax
DiscountCalculator ..> Discount
PaymentValidator ..> Payment

IBillRepository <|.. SqlBillRepository
IPaymentRepository <|.. SqlPaymentRepository
IReceiptRepository <|.. SqlReceiptRepository
IRefundRepository <|.. SqlRefundRepository
IPaymentGateway <|.. StripePaymentGateway
IReceiptFormatter <|.. PdfReceiptFormatter
IReceiptPrinter <|.. ThermalReceiptPrinter
IBillSplitStrategy <|.. ItemBasedSplitStrategy
ITipDistributionStrategy <|.. PooledTipDistributionStrategy
IAuditLogger <|.. DatabaseAuditLogger
IDomainEventPublisher <|.. EventBusPublisherAdapter

BillingEventPublishingServiceImpl --> IDomainEventPublisher