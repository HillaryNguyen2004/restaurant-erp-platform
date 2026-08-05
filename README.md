# Restaurant ERP — Full Capability Map

Feature decomposition for a multi-location restaurant ERP. Organized by domain, with priority tiers and notes on which existing service absorbs each capability versus which require new services.

**Priority tiers**
- **P0** — without this it is not an ERP. Non-negotiable.
- **P1** — expected by any serious buyer; absence is disqualifying in evaluation.
- **P2** — competitive differentiation; build after P0/P1 are solid.

---

## 1. Identity, Tenancy & Access Control
*Extends: Identity service*

| Capability | Detail | Tier |
|---|---|---|
| Org hierarchy | Organization → Brand → Region/District → Location. Regions matter: area managers own 8–12 sites and need a scope between brand and location | P0 |
| Ownership model | Corporate-owned vs. franchised vs. licensed locations. Different data visibility, different fee structures, different reporting obligations | P0 |
| ABAC policies | Attributes beyond role: location scope, daypart, dollar threshold, ownership type. "Shift lead can void up to $50 at their own location during their own shift" | P1 |
| Manager override | PIN/badge elevation for a single transaction, fully audited. Every POS in the world needs this | P0 |
| SSO | SAML/OIDC for corporate staff; separate lightweight auth for hourly staff (PIN, badge) | P1 |
| Service accounts | API keys with scoped permissions for integrations and partner access | P1 |
| Immutable audit log | Who, what, where, when, before/after. Append-only. This is what auditors and franchise disputes run on | P0 |
| Employee/guest separation | Two distinct identity domains that must never merge | P0 |
| Data residency | Per-organization storage region binding | P2 |

---

## 2. Master Data Management
*New service — this is the single biggest gap in your current design*

Every ERP has an MDM layer. Without it you get the same ingredient defined eleven different ways across eleven locations and your variance reporting becomes meaningless.

| Capability | Detail | Tier |
|---|---|---|
| Item master | Single catalog of ingredients, prep items, finished goods, non-food supplies (napkins, cleaning), with global IDs | P0 |
| **UOM conversion graph** | Purchase UOM → stock UOM → recipe UOM. A case of tomatoes → 6 × #10 cans → 2.7 kg each → 15 g per portion. Every costing and variance number depends on this being right, and it is the most commonly underbuilt piece in homegrown systems | P0 |
| Vendor master | Deduplicated vendor records with tax IDs, terms, remit-to addresses | P0 |
| Chart of accounts | Shared across entities with location-level segment mapping | P0 |
| Tax code registry | Jurisdiction rules, rates, effective dates | P0 |
| Effective dating | Every master record versioned by date. Recosting last month requires last month's prices, not today's | P0 |
| Change approval workflow | Master data edits route for approval; locations propose, corporate approves | P1 |
| Item categorization | Multi-hierarchy: reporting category, purchasing category, GL category — these are not the same hierarchy | P1 |

---

## 3. Menu & Product Engineering
*Extends: Order & Menu service*

| Capability | Detail | Tier |
|---|---|---|
| Modifier system | Modifier groups with min/max, forced vs. optional, nested modifiers, price deltas per modifier. "No onions" is free; "add avocado" is $2; "substitute salmon" is +$6 | P0 |
| Combos & bundles | Component pricing, substitution rules, upsell paths | P1 |
| Dayparting | Breakfast/lunch/dinner/late-night menus with automatic switching per location timezone | P0 |
| Channel menus | Dine-in vs. delivery vs. takeout menus and *prices*. Delivery markup to offset commission is standard practice | P0 |
| Price books | Effective-dated pricing, scheduled rollouts, price change approval | P0 |
| Brand inheritance | Brand owns canonical items; locations hold scoped overrides for price and availability. Corporate price push must not clobber approved local adjustments | P0 |
| 86 management | Real-time out-of-stock propagation to POS, KDS, online ordering, and delivery partners simultaneously | P0 |
| Menu engineering matrix | Popularity × contribution margin → stars / plowhorses / puzzles / dogs. Drives menu redesign decisions | P1 |
| Allergen & nutrition | Rolled up from recipe BOM automatically, not hand-entered | P1 |
| Item lifecycle | Draft → approved → active → 86'd → retired, with test-market flags per location | P2 |

---

## 4. Recipe, BOM & Costing
*Extends: Recipe & Costing service — currently your thinnest area relative to its importance*

This is the analytical core of a restaurant ERP. Everything downstream depends on it.

| Capability | Detail | Tier |
|---|---|---|
| Multi-level BOM | Ingredient → prep recipe → sub-recipe → menu item. A burger contains a patty (prep) containing ground beef (ingredient) and a sauce (sub-recipe) | P0 |
| Yield & waste factors | Trim loss, cooking loss, shrink. 1 kg raw beef is not 1 kg cooked beef; recipes costed on raw weight are wrong by 20–30% | P0 |
| Costing method | Choice of moving average, FIFO, last cost, or standard cost — with the choice configurable per organization. Auditors care which one you use | P0 |
| Automatic cost rollup | Vendor price change cascades through every BOM level to every affected menu item, flagging items whose margin dropped below threshold | P0 |
| Recipe versioning | Effective-dated recipes so historical variance is computed against the recipe in force at the time | P0 |
| What-if simulation | "If beef rises 12%, which items fall below 65% margin and what price change restores it?" | P1 |
| Substitution rules | Approved alternates with automatic recost when primary is unavailable | P1 |
| Batch production planning | Prep quantities derived from forecast; batch yield tracking | P1 |
| Plate cost & contribution margin | Per item, per location — costs differ by location because vendor prices differ | P0 |

---

## 5. Inventory
*Extends: Inventory service*

| Capability | Detail | Tier |
|---|---|---|
| Multi-storeroom | Walk-in, freezer, dry store, bar, each counted separately within a location | P0 |
| Perpetual + periodic | Continuous depletion from sales, reconciled by physical counts | P0 |
| Count workflows | Full, cycle, and spot counts. Blind counts (counter cannot see expected quantity) to prevent count-to-target fraud | P0 |
| Count sheets | Ordered by physical storeroom walk path, mobile-friendly, offline-capable | P1 |
| Variance approval | Counts producing variance beyond threshold require manager sign-off before posting | P0 |
| Waste logging | Reason codes: spoilage, over-portion, comp, staff meal, prep error, breakage. Reason-coded waste is what separates diagnosable loss from mystery loss | P0 |
| Lot & expiry tracking | FEFO rotation, expiry alerts, recall traceability from lot to the orders that consumed it | P1 |
| Transfers | Location-to-location and storeroom-to-storeroom, with in-transit state and receiving confirmation | P0 |
| Par levels | Static pars, then forecast-driven dynamic pars | P0 |
| Valuation & period close | Month-end freeze, opening/closing inventory value, posting to GL | P0 |
| Variance analytics | By ingredient, category, location, shift, and manager on duty — ranked by dollar impact, not percentage. A 40% variance on parsley matters less than 3% on beef | P0 |

---

## 6. Procurement & Supply Chain
*New service*

| Capability | Detail | Tier |
|---|---|---|
| Vendor contracts | Negotiated price agreements, effective dates, delivery windows, order minimums, lead times | P0 |
| Order guides | Per-location approved purchase lists — what this site is allowed to buy and from whom | P0 |
| Multi-vendor comparison | Same item across vendors with landed-cost comparison | P1 |
| Requisition → approval → PO | Threshold-based approval routing | P0 |
| Automated PO generation | From par shortfall or forecast, batched by vendor and delivery day | P0 |
| **3-way match** | PO vs. goods receipt vs. invoice, with configurable tolerance. Mismatches route to exception queue. This is the control that catches supplier overbilling and it is the heart of procurement | P0 |
| Receiving | Partial receipts, over/under tolerance, quality rejection, temperature capture on delivery | P0 |
| Credit memos & returns | Damaged goods, short shipments, price corrections | P0 |
| Invoice capture | OCR/EDI ingestion of vendor invoices, line-item extraction | P1 |
| Vendor scorecards | Fill rate, on-time delivery, price variance vs. contract, quality rejection rate | P1 |
| Contract compliance | Flag locations purchasing off-contract or off-guide | P1 |
| Commissary / central kitchen | Internal production facility supplying locations; inter-company transfer pricing and elimination entries | P2 |

---

## 7. Sales & Order Capture
*Extends: Order service*

| Capability | Detail | Tier |
|---|---|---|
| Multi-channel | Dine-in, takeout, delivery, drive-thru, catering, kiosk, QR-at-table — one order model, channel-specific rules | P0 |
| **Offline mode** | POS must take orders and payments when the network drops, then reconcile. Non-negotiable for physical restaurants and a genuinely hard distributed-systems problem — a strong portfolio piece | P0 |
| Check management | Split by seat, by item, evenly, by percentage; merge checks; transfer check between servers | P0 |
| Course firing | Hold/fire per course, timing rules, coordinated table delivery | P1 |
| Discounts & comps | Percentage, fixed, item-level, check-level, all with reason codes and approval thresholds | P0 |
| Voids | Pre-send vs. post-send void distinction — post-send means food was made and wasted, and must hit inventory | P0 |
| Promotions engine | Rule-based: happy hour, BOGO, bundles, time/day/location conditions, stacking rules | P1 |
| Loyalty | Points, tiers, rewards, cross-location accrual and redemption | P1 |
| Gift cards & stored value | Issuance, balance, cross-location liability tracking (this is a balance-sheet item) | P1 |
| Tips | Declaration, pooling rules, distribution to support staff, compliance reporting | P0 |
| Catering & events | Quotes, deposits, BEOs, delivery scheduling, invoicing to house accounts | P2 |

---

## 8. Kitchen Operations
*Extends: Kitchen service*

| Capability | Detail | Tier |
|---|---|---|
| Station routing | Item-to-station rules per location layout; dynamic rerouting when a station is overloaded | P0 |
| Display types | Line stations, expo, prep, drive-thru, delivery staging — different views on the same tickets | P0 |
| Timing & SLA | Ticket age, bump times, speed-of-service by daypart, target vs. actual | P0 |
| Recipe display | Prep instructions and plating at the station | P1 |
| Prep lists | Tomorrow's prep quantities from forecast, adjusted for on-hand | P1 |
| Food safety | Temperature logs, HACCP checklists, cooling logs, equipment monitoring, with exception alerting | P1 |
| Production planning | Batch scheduling for commissary or high-volume prep | P2 |

---

## 9. Guest & CRM
*Extends: Reservation service*

| Capability | Detail | Tier |
|---|---|---|
| Reservations | Booking, waitlist, table combination optimization, deposits, no-show fees | P0 |
| Guest profile | Cross-location visit history, lifetime spend, preferences, allergies, VIP and do-not-serve flags | P1 |
| Segmentation & campaigns | Behavioral segments, targeted offers, campaign attribution to revenue | P2 |
| Feedback | Post-visit surveys, review aggregation, response workflow, sentiment by location | P2 |

---

## 10. Payment, Tax & Revenue
*Extends: Billing service*

| Capability | Detail | Tier |
|---|---|---|
| Multi-tender | Split tender, partial payment, cash/card/wallet/gift/house account on one check | P0 |
| Processor abstraction | Pluggable gateway adapters; tokenization so card data never enters your systems (PCI scope reduction) | P0 |
| Service charges | Auto-gratuity, large-party charges, delivery fees, surcharges — each with distinct tax and tip-pool treatment | P0 |
| Tax engine | Inclusive vs. exclusive, multi-jurisdiction, dine-in vs. takeaway rate differences, exemption certificates | P0 |
| Fiscalization | Many jurisdictions mandate government e-invoicing or certified fiscal devices. Pluggable per-country compliance adapters | P1 |
| Cash management | Drawer assignment, blind drop, cash-up, over/short by employee, safe reconciliation, deposit tracking | P0 |
| Disputes | Chargeback handling and evidence assembly | P2 |

---

## 11. Finance & Accounting
*New service — the largest single addition*

| Capability | Detail | Tier |
|---|---|---|
| Multi-entity GL | Legal entities distinct from locations; one entity may own several sites | P0 |
| Daily sales journal | Automated posting of sales, tax, tenders, discounts, and comps to GL each business day | P0 |
| AP | Invoice register, approval routing, payment runs, aging, vendor statements | P0 |
| AR | House accounts, catering invoices, corporate billing, collections | P1 |
| Bank reconciliation | Statement import, auto-matching, unmatched exception queue | P1 |
| **Prime cost** | Food cost + labor cost as % of sales, tracked daily. This is the number restaurant operators actually manage to — surfacing it in near-real-time is a genuine differentiator | P0 |
| P&L | Per location, per brand, per region, consolidated, with drill-through to source transactions | P0 |
| Budgeting & forecasting | Annual budgets by location, rolling forecasts, variance-to-budget reporting | P1 |
| Period close | Close checklist, sub-ledger reconciliation, period locking, adjusting journals | P0 |
| Fixed assets | Equipment register, depreciation schedules, maintenance and warranty tracking | P2 |
| Franchise accounting | Royalty calculation from gross sales, marketing fund contributions, franchisee statements, automated collection | P1 |
| Inter-company | Transfer pricing between commissary and locations, elimination entries on consolidation | P2 |

---

## 12. Workforce
*New service*

| Capability | Detail | Tier |
|---|---|---|
| Employee master | Positions, pay rates by position, multi-location assignment, employment status | P0 |
| Certifications | Food handler cards, alcohol service permits, with expiry alerting and shift-eligibility blocking | P1 |
| Scheduling | Templates, demand-driven generation from sales forecast, skill and certification matching | P0 |
| **Labor compliance** | Break enforcement, overtime thresholds, minor work restrictions, predictive scheduling laws, split-shift premiums. Jurisdiction-specific rule engine — violations carry statutory penalties | P0 |
| Time & attendance | Clock in/out with PIN, badge, or geofence; early/late clock-in enforcement; missed punch correction workflow | P0 |
| Shift marketplace | Swap requests, open shift pickup, availability management, all with manager approval and compliance checks | P1 |
| Real-time labor % | Labor cost against live sales during the shift, so a manager can cut staff at 2pm rather than discover the overage on Monday | P0 |
| Payroll export | Hours, tips, and premiums formatted for payroll providers | P0 |
| Training & onboarding | Certification tracking, training modules, performance notes | P2 |

---

## 13. Analytics & Intelligence
*Extends: Analytics service*

| Capability | Detail | Tier |
|---|---|---|
| Executive dashboard | Sales, prime cost, food cost %, labor %, guest count, average check — by location and consolidated | P0 |
| **Same-store sales** | Year-over-year comparison excluding locations open under 12 months. The headline metric for any multi-unit operator, and easy to get wrong | P0 |
| Product mix (PMIX) | Item-level sales volume and margin contribution by daypart and location | P0 |
| Location benchmarking | Ranked performance across the group with normalization for size and market | P1 |
| Forecasting | Sales forecast by daypart driving labor scheduling, prep quantities, and purchasing | P1 |
| **Loss anomaly detection** | Void patterns by employee, discount abuse, cash variance clustering, unusual comp rates, refund-after-close. Restaurant theft is a real and quantified problem; detection is high-value | P1 |
| Report builder | User-defined reports, scheduled email delivery, export | P1 |
| Warehouse export | Feed to external BI tooling | P2 |

---

## 14. Integration Platform
*New service*

| Capability | Detail | Tier |
|---|---|---|
| Delivery aggregators | Menu sync, order injection, status callback, 86 propagation, reconciliation of commission and payout | P0 |
| Accounting systems | Bidirectional sync with mainstream accounting packages for organizations not using the internal GL | P1 |
| Payroll providers | Hours and tips export | P1 |
| Payment gateways | Multiple processors per organization | P0 |
| Public API & webhooks | Documented, versioned, with a developer portal | P1 |
| Connector framework | Reusable adapter pattern with retry, backoff, dead-letter, and per-connector health monitoring | P1 |

---

## 15. Cross-Cutting Platform
*Shared libraries and platform services*

| Capability | Detail | Tier |
|---|---|---|
| Workflow engine | Reusable approval routing consumed by procurement, master data, scheduling, and finance rather than reimplemented in each | P1 |
| Notification engine | Multi-channel (in-app, email, SMS, push) with per-user preference and escalation rules | P0 |
| Document store | Invoices, contracts, receipts, HACCP logs, with retention policies | P1 |
| Configuration service | Per-location settings hierarchy with inheritance and override | P0 |
| Feature flags | Per-tenant and per-location rollout control | P1 |
| Localization | i18n, multi-currency with rate management, locale-aware formatting | P0 |
| Offline sync framework | Shared conflict-resolution strategy for POS, counts, and time clock | P0 |

---

## Service decomposition implications

Your existing eight services absorb roughly half of the above. The remainder needs new services:

| New service | Absorbs | Language fit |
|---|---|---|
| Master Data | Domain 2 | Either — low volume, high consistency needs |
| Procurement | Domain 6 | Workflow-heavy; Spring Boot |
| Finance | Domain 11 | Decimal precision and transaction integrity; Spring Boot |
| Workforce | Domain 12 | Rule-engine heavy; either |
| Integration | Domain 14 | I/O-bound with many connectors; NestJS |
| Notification | Domain 15 subset | I/O-bound; NestJS |

That takes you from 8 to 14 services. Consider whether Reservation and Guest CRM should split, and whether Analytics should separate real-time metrics from batch reporting — they have very different scaling profiles.

---

## Suggested build order

Building all of this is years of work. If the goal is a credible ERP demonstration, this sequence produces the most convincing system soonest, because each phase makes the previous one more valuable:

1. **Master data + UOM conversion.** Nothing downstream is trustworthy without it. Unglamorous, foundational, and its absence is the tell that a system was never designed for scale.
2. **Recipe BOM with yield factors → plate costing.** Turns your existing order data into margin data.
3. **Theoretical vs. actual variance.** The signature feature. Now your existing inventory and order services produce a number nobody can get from a spreadsheet.
4. **Procurement with 3-way match.** Closes the loop from variance to purchasing decisions.
5. **Prime cost dashboard.** Combines food and labor into the one metric operators manage to — and it demonstrates cross-context integration working end to end.
6. **Workforce scheduling with live labor %.** Completes prime cost with the labor half.
7. **Finance GL with daily sales journal.** Makes it an ERP rather than an operations suite.

Phases 1–3 alone move the system from "restaurant app" to "ERP," and they build almost entirely on services you already have.