HIỆN TẠI CHƯA FIX ĐƯỢC LỖI NÀO DƯỚI ĐÂY:
- KITCHENT KHÔNG LẤY ĐC TICKET (CHẮC DO BACKEND CHIA THEO STATION, T LOG IN MAIN STATION NÊN K THẤY ĐƯỢC?)
- CHƯA TEST WS Ở KITCHEN


# Restaurant System Test Flow

This document outlines the end-to-end flow for testing the Intelligent Restaurant Management System.

## Main Operational Flow

### 1. Table Occupancy (Server)
- **Role**: SERVER
- **Action**: Go to `/tables`. Click **"Open Table"** on an available table (Green).
- **Result**: Table turns Red (OCCUPIED). A dining session and an order session are created in the backend.

### 2. Placing an Order (Server)
- **Role**: SERVER
- **Action**: Click on the occupied table. Go to **"ADD ITEMS"** tab. Select items and click **"Place Order"**.
- **Result**: Items appear in the **"ORDERS"** tab. A kitchen ticket is generated.

### 3. Kitchen Processing (Chef)
- **Role**: CHEF / KITCHEN_STAFF
- **Action**: Go to `/kds`. The new ticket appears in the grid.
- **Workflow**:
  - Click **"Start Cooking"**: Ticket status changes to `IN_PROGRESS`.
  - Click **"Mark Ready"**: Ticket status changes to `READY`.
- **Realtime Trigger**: When the Chef marks a ticket as `READY`, a realtime event is emitted.

### 4. Realtime Notification (Server)
- **Role**: SERVER
- **Action**: While on the `/tables` page, look for a **Red Pulsing Dot** on the top right of the table card.
- **Notification**: A toast notification appears: *"Order Ready for Table X!"*.
- **Result**: The Server knows the food is ready for pickup.

### 5. Serving & Closing (Server/Cashier)
- **Action**: Once the food is served, the status eventually moves to `SERVED` (this can be automated or manual in future steps).
- **Payment**:
  - **Role**: CASHIER
  - **Action**: Open the table, go to **"BILL & PAY"**, and click **"Mark as Paid"**.
- **Result**: Table returns to Green (AVAILABLE).

## Role Summary for Testers
- **SERVER**: `staff` / `staff123` (Access to `/tables`, `/menu`)
- **CHEF**: `chef` / `chef123` (Access to `/kds`)
- **CASHIER**: `cashier` / `cashier123` (Access to `/tables` billing view)

## Technical Verification Points
- **WebSockets**: Check console for `[Realtime] Received event: ORDER_STATUS_UPDATED`.
- **API Ports**: 8002 (Table), 8003 (Order), 8004 (Kitchen).
- **Kong Gateway**: All requests go through `http://localhost:8000`.



