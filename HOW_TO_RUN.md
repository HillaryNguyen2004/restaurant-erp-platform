# How to Run This Project

Sets up the full backend stack (Postgres, Kafka, Kong gateway, all four
microservices) plus the frontend, on a fresh machine.

## Prerequisites

- Docker + Docker Compose
- Node.js (18+) and npm — needed both for the frontend and by the seed script

## 0. Check the Postgres port

Both `docker-compose.yml` (root) and `services/docker-compose.yml` map Postgres
to host port **5433**, not the default 5432, so the stack won't collide with a
local Postgres/pgAdmin install:

```yaml
ports:
  - "5433:5432"
```

If you pulled a version that still says `"5432:5432"` and you have Postgres
running locally, change it to `5433` or the container will fail to bind.

## 1. Start the backend stack

The real stack (with the Kong gateway the frontend talks to) lives in
`services/`, **not** the root `docker-compose.yml`.

```bash
cd services
docker compose up --build -d
```

This starts:

- `irms-postgres` — Postgres on host port **5433**
- `irms-kafka` + `irms-zookeeper`
- `user-management-service` (8001), `table-reservation-management-service`
  (8002), `order-menu-service` (8003), `kitchen-operation-service` (8004)
- `irms-kong` — API gateway on port **8000**, routing `/user-management`,
  `/table-reservation`, `/order-menu`, `/kitchen-operation` to the services

First build takes several minutes (two Spring Boot images). Wait for Postgres
to report healthy before continuing:

```bash
docker inspect irms-postgres --format '{{.State.Health.Status}}'
```

Then confirm all containers are up:

```bash
docker compose ps
```

## 2. Seed the demo data

**Use the seed script. Do not seed by hand.**

```bash
cd services
./scripts/seed-demo.sh
```

This one script seeds everything the frontend needs, and is idempotent — safe
to re-run:

- Users with roles (CHEF, SERVER, CASHIER, ADMIN, MANAGER) — the frontend maps
  `SERVER`/`TABLE_STAFF` to the tables view and `CHEF`/`KITCHEN_STAFF` to the
  KDS, so the built-in roles are sufficient
- Kitchen stations (grill, cold, fryer, wok, oven, dessert, drinks, coffee)
- 11 menu categories and ~35 menu items
- **Restaurant tables** — with fixed UUIDs
- Reservations, live order sessions, and a few demo orders

> ⚠️ **Seeding tables is the step that's easy to miss.** If you register users
> and menu items manually but skip tables, the tables page renders IDs the
> `table-reservation` service has never heard of, and every call 404s with
> `Table <uuid> not found`. If you see that, you skipped this script.

Verify:

```bash
curl -s http://localhost:8000/table-reservation/tables | head -c 400
curl -s http://localhost:8000/order-menu/menu | head -c 400
```

Both must return `200` with non-empty JSON arrays.

## 3. Configure the frontend

In [`intelligent-restaurant-fe/lib/config.ts`](intelligent-restaurant-fe/lib/config.ts),
make sure mock mode is **off**. Menu/order/table calls always hit the real
backend regardless of this flag, so mock mode only half-works — and mock login
returns fake IDs like `u1` that the real backend rejects as invalid UUIDs.

```ts
export const CONFIG = {
  IS_MOCK: false,
  API_URL: 'http://localhost:8000',
  WS_URL: 'ws://localhost:8000',
};
```

## 4. Run the frontend

```bash
cd intelligent-restaurant-fe
npm install
npm run dev
```

Open http://localhost:3000.

## 5. Log in

On a **fresh database**, all accounts seeded by the script use password
**`secret123`**.

> ⚠️ **If a login returns 401, try `password123`.** `seed-demo.sh` only sets a
> password when it *creates* a user — `ensure_user` treats an existing email as
> a no-op and just attaches the role. So any account created before you first
> ran the script keeps its original password. On the original dev machine those
> users were registered by hand with `password123`, and re-running the seed
> script will never change that. To force every account onto `secret123`, wipe
> the volume and reseed:
>
> ```bash
> cd services
> docker compose down -v && docker compose up -d
> ./scripts/seed-demo.sh
> ```

| Email | Role | Lands on |
|---|---|---|
| `staff@example.com` | SERVER | `/tables` |
| `chef@example.com` | CHEF | `/kds` |
| `cashier@example.com` | CASHIER | billing |
| `manager@example.com` | MANAGER | — |
| `admin@example.com` | ADMIN | — |

More accounts (`server.anna@`, `chef.grill@`, `customer.mai@`, …) are listed at
the bottom of `scripts/seed-demo.sh`.

## Shutting down / restarting

```bash
cd services
docker compose down       # stop everything, keep data
docker compose up -d      # restart (no --build unless source changed)
```

Postgres data lives in the `irms_pgdata` volume and survives restarts. You only
need to re-run the seed script after `docker compose down -v` or on a fresh
machine.

## Troubleshooting

- **`Conflict. The container name "/kafka" is already in use`** — a stack from
  another checkout is still running under a different Compose project name.
  Find it with
  `docker inspect <container> --format '{{index .Config.Labels "com.docker.compose.project"}}'`
  and stop it with `docker compose -p <that-project-name> down`.
- **Postgres `unhealthy` right after starting** — usually crash recovery from an
  unclean shutdown. Check `docker logs irms-postgres` for
  `database system is ready to accept connections` and wait it out.
- **`404 Table <uuid> not found`** — tables were never seeded. Run
  `./scripts/seed-demo.sh` (step 2).
- **`400 Bad Request` on `/order-sessions/table/...`** — the table ID isn't a
  valid UUID, which happens when `IS_MOCK` is `true`. See step 3.
- **`404` on `GET /order-menu/order-sessions/table/<uuid>`** — this is
  **normal**. It's the API saying "this table has no open session yet," and the
  frontend already handles it (`if (response.status === 404) return null`).
  Chrome logs every 404 to the console whether or not your code handles it.

## WebSocket notes

Realtime is wired up and **works**. Three endpoints, all proxied through Kong on
port 8000:

| Frontend URL | Service | Handler |
|---|---|---|
| `ws://localhost:8000/table-reservation/ws/tables` | table-reservation (NestJS/Fastify) | `TableWsGateway` |
| `ws://localhost:8000/order-menu/ws/orders` and `/ws/menu` | order-menu (Spring) | `WebSocketConfig` |
| `ws://localhost:8000/kitchen-operation/ws/kds` | kitchen-operation (Spring) | `WebSocketConfig` |

Confirm connections are landing:

```bash
docker compose logs --tail=20 table-reservation-management-service | grep TableWsGateway
```

You should see `WS client connected from 172.20.x.x` — that IP is the Kong
container, which means browser → Kong → service is working end to end.

### Two gotchas — read before "fixing" anything

1. **Don't add a service prefix to the Spring WebSocket handler paths.** Both
   Java services set `server.servlet.context-path` (`/order-menu` and
   `/kitchen-operation`) in `application.properties`. That prefix is applied
   automatically, so `registry.addHandler(handler, "/ws/orders")` is already
   served at `/order-menu/ws/orders`. Kong forwards the full path
   (`strip_path: false`), so the paths line up as-is. Adding the prefix
   manually produces `/order-menu/order-menu/ws/orders` and breaks it.

2. **`WebSocket is closed before the connection is established` in the console
   is harmless dev noise.** React StrictMode mounts effects twice in dev; the
   first socket gets closed while still `CONNECTING`, which fires a spurious
   error event. The provider now waits for the handshake before closing and
   suppresses errors from its own teardown
   ([`providers/realtime-provider.tsx`](intelligent-restaurant-fe/providers/realtime-provider.tsx)),
   but if you still see it, it is not the cause of a sync problem — check the
   container logs above to confirm the socket actually connected.
