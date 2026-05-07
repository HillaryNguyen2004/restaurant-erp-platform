# CONTEXT & ROLE
Bạn là một Senior Frontend Architect và Next.js Expert. Nhiệm vụ của bạn là xây dựng hệ thống "Intelligent Restaurant Frontend" dựa trên Next.js (App Router), Shadcn UI, Tailwind CSS, Tanstack Query, WebSocket và Playwright.
Project được đặt trong thư mục `intelligent-restaurant-fe`. Ngôn ngữ web là tiếng anh

# BƯỚC 1: ĐỌC VÀ ĐỒNG BỘ DATA MODEL
Trước khi code, hãy đọc toàn bộ module diagram và các file backend trong thư mục `services/` của dự án (đặc biệt là các file định nghĩa Entity, DTO, Enum). 
Dựa vào đó, hãy trích xuất và ánh xạ các model này thành Zod Schemas và TypeScript Types cho Frontend.

# BƯỚC 2: ARCHITECTURE DESIGN (STRICT RULE)
Bạn PHẢI tuân thủ cấu trúc Feature-Driven Architecture. Tuyệt đối không tạo các components hay logic lộn xộn ở global. Mọi tính năng phải được đóng gói trong thư mục `features/`.

Cấu trúc chuẩn của một Feature (Ví dụ: `features/order`):
- `features/order/components/`: Chứa các UI component dùng lại (vd: TicketCard, OrderStatus). Dùng Shadcn UI.
- `features/order/config/`: Chứa `order.config.ts` (Zod schemas, Types).
- `features/order/data-access/`: 
  - `order.api.ts`: Hàm gọi REST API.
  - `order.queries.ts`: Hooks `useQuery`, `useMutation` của Tanstack Query.
  - `order.realtime.ts`: (NEW) Custom hooks để xử lý Realtime (lắng nghe WebSocket/LocalStorage và update Tanstack Cache).

Danh sách các features cần tạo: `auth`, `menu`, `order`, `kds` (Kitchen Display System), `table-management`, `analytics`.

# BƯỚC 3: INFRASTRUCTURE & PROVIDERS
1. Tạo `QueryProvider` bọc toàn bộ app.
2. Tạo `AuthProvider` quản lý RBAC (Role-Based Access Control) cho 4 roles: `CUSTOMER`, `CHEF`, `CASHIER`, `ADMIN`.
3. Tạo `RealtimeProvider` hoặc `WebSocketProvider`: Chịu trách nhiệm khởi tạo kết nối Socket (nếu dùng Real API) hoặc khởi tạo EventListener (nếu dùng Mock API).

# BƯỚC 4: ROLE-BASED FEATURES & REALTIME IMPLEMENTATION

## 1. CUSTOMER ROLE (Dành cho khách tại bàn)
- Menu: Hiển thị menu chia category bằng Tabs (Food/Drink).
- Đặt món: Bấm `+` -> Mở `Dialog` chọn số lượng -> Gọi Mutation thêm vào Order.
- Realtime: Lắng nghe event `ORDER_STATUS_UPDATED` để biết món ăn đã nấu xong chưa.

## 2. CHEF ROLE (KDS - Kitchen Display System)
- Realtime: Lắng nghe event `NEW_TICKET_CREATED`. Khi có order mới, tự động `queryClient.invalidateQueries(['tickets'])` hoặc update cache để render UI realtime.
- Thao tác: Bấm chuyển trạng thái ticket (Pending -> Cooking -> Done), gọi Mutation update.

## 3. CASHIER ROLE (Thu ngân / Quản lý bàn)
- View: Quản lý danh sách bàn (Empty, Reserved, Occupied).
- Realtime: Lắng nghe event `TABLE_STATUS_CHANGED` để cập nhật màu sắc/trạng thái bàn trên Grid ngay lập tức.

## 4. ADMIN ROLE
- Tương tự như cũ, tạo Mockup page xem báo cáo thống kê.

# BƯỚC 5: MOCK API VS REAL API (HYBRID STRATEGY)
Tại file config global (`env` hoặc `constants`), có cờ `IS_MOCK`.
Hãy implement cơ chế Realtime Hybrid như sau tại thư mục `data-access/`:

1. NẾU `IS_MOCK === true` (Đang ưu tiên test hiện tại):
  - API Mutations: Thao tác CRUD trực tiếp với `localStorage`.
  - Realtime Events: Phát trigger thông qua `window.dispatchEvent(new Event('storage'))` hoặc `BroadcastChannel`. 
  - Các hooks realtime (`order.realtime.ts`) sẽ lắng nghe Storage events giữa các tab để tự động update Tanstack Query Cache (Ví dụ: Tab Cashier update -> Tab Chef tự nhảy UI).

2. NẾU `IS_MOCK === false` (Sử dụng Real API):
  - API Mutations: Gọi REST API (fetch/axios) thông qua endpoint đọc từ `services/`.
  - Realtime Events: Các hooks sẽ lắng nghe `socket.on(...)` từ WebSocket Server.
  - Xử lý cache: Khi nhận Socket event, dùng `queryClient.setQueryData` để update UI tối ưu nhất.

# BƯỚC 6: E2E TESTING VỚI PLAYWRIGHT
- Viết test trong `tests/e2e/`. Sử dụng Playwright.
- Test realtime flow bằng cách mở 2 browser contexts trong 1 test case:
  1. Context A (Customer): Đặt món.
  2. Context B (Chef): Assert rằng UI của Chef tự động xuất hiện ticket mới mà KHÔNG cần reload trang (nhờ Mock LocalStorage/BroadcastChannel).

# EXECUTION PLAN
Hãy thực hiện theo từng bước. Đừng generate toàn bộ code trong 1 message. 
1. Xác nhận bạn hiểu kiến trúc (Feature-driven + Tanstack Query + WebSocket/LocalStorage Hybrid).
2. Generate cấu trúc thư mục, các Providers (Auth, Query, Realtime) và Zod Schemas.
3. Chờ tôi gõ "Tiếp tục" trước khi đi vào từng Feature cụ thể.