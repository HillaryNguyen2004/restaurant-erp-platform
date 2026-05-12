# WebSocket needs

Scope: KDS + order-menu only.

Main decision: keep commands and initial reads as REST. Add WebSocket only for server-pushed changes that another screen must see without refresh.

## WebSocket Heartbeat

All WebSocket clients should send a heartbeat message every 25 seconds to keep the connection alive through Kong/API gateway and other proxies.

Client heartbeat message:

```json
{"type":"ping"}
```

Server heartbeat response:

```json
{"type":"pong"}
```

Rules:
- The heartbeat message must exactly match {"type":"ping"}.
- The server replies with {"type":"pong"}.
- Client commands should not be sent through WebSocket.
- Unknown client messages are ignored by the server.
- If the socket closes, frontend should reconnect automatically.

Frontend behavior:
- Ignore {"type":"pong"} messages.
- Process backend events using eventType.
- Use REST for initial reads and commands.


## Really Need WebSocket

### 1. KDS ticket stream

Proposed endpoint:
- `WS /kitchen-operation/ws/kds`

Subscribe by:
- `stationId`

Events:
- `kitchen.ticket.created`
- `kitchen.ticket.status.changed`
- `kitchen.ticket.alert.triggered`

Why:
- KDS is a live screen.
- Frontend currently polls `GET /kitchen-operation/kitchen/stations/{stationId}/tickets` every 10 seconds.
- New tickets come from order-menu events through kitchen-operation, so kitchen staff need push immediately.

REST stays:
- `GET /kitchen-operation/kitchen/stations/{stationId}/tickets`
- `GET /kitchen-operation/kitchen/stations/{stationId}/dashboard`
- `PATCH /kitchen-operation/kitchen/tickets/{ticketId}/status`

### 2. Order status stream

Proposed endpoint:
- `WS /order-menu/ws/orders`

Subscribe by:
- `orderSessionId`
- optional `tableId`

Events:
- `order.placed`
- `order.item.updated`
- `order.cancelled`
- `order.status.changed`

Why:
- Customer/table order sheet needs live status after kitchen changes.
- Multiple clients can view or edit same order/session.
- Requesting client already gets REST response, but other clients need push.

REST stays:
- `POST /order-menu/order-sessions/{orderSessionId}/orders`
- `PUT /order-menu/order-sessions/{orderSessionId}/orders/{orderId}/cancel`
- `PUT /order-menu/order-sessions/{orderSessionId}/orders/{orderId}/items/{itemId}`

## Optional WebSocket

### 3. Menu availability stream

Proposed endpoint:
- `WS /order-menu/ws/menu`

Events:
- `menu.item.available`
- `menu.item.unavailable`

Use only if:
- menu availability can change while customers are ordering
- stale menu items must disappear or disable immediately

REST stays:
- `GET /order-menu/menu`
- `GET /order-menu/menu/categories/{menuCategoryId}/items`
- `GET /order-menu/menu/items/{itemId}`
- `PUT /order-menu/menu-management/items/{itemId}/available`
- `PUT /order-menu/menu-management/items/{itemId}/unavailable`

## Not Needed As WebSocket Now

### KDS

- `POST /kitchen-operation/kitchen/courses/fire`
  - Deprecated or optional.
  - Do not use this for chef "start cooking".
  - Chef start/complete actions should use `PATCH /kitchen-operation/kitchen/tickets/{ticketId}/status`.
  - Keep only if delayed course firing is needed later.
- `GET /kitchen-operation/kitchen/tickets/{ticketId}`
  - Keep REST for detail fetch.
- `GET /kitchen-operation/kitchen/stations`
  - Keep REST. Station list is setup data.
- station create/update/delete routes
  - Keep REST. Not part of live ticket flow.

### Order Menu

- `POST /order-menu/order-sessions`
  - Keep REST. Caller needs immediate create response.
- `PUT /order-menu/order-sessions/{orderSessionId}/close`
  - Keep REST. Add push later only if another client must be kicked out of active ordering.
- `GET /order-menu/order-sessions/{orderSessionId}`
  - Keep REST for initial load.
- `GET /order-menu/order-sessions/table/{tableId}`
  - Keep REST for initial load.
- menu item/category create/update/delete
  - Keep REST. Push only availability changes for now.
- promotion create/update/delete
  - Keep REST. No current KDS/order-menu realtime dependency.
- `GET /order-menu/promotions/active`
  - Keep REST.

## Frontend Event Map

- `NEW_TICKET_CREATED` -> `kitchen.ticket.created`
- `ORDER_STATUS_UPDATED` -> `kitchen.ticket.status.changed` or `order.status.changed`
- `NEW_ORDER_PLACED` -> `order.placed`

