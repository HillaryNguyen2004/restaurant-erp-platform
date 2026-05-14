# Order Menu Service

## Commands

```bash
# from services/order-menu
./gradlew bootRun            # run local (default: in-memory persistence)
./gradlew build              # build
./gradlew test               # test
```

```bash
# from repo root (run with Kafka + Postgres via docker-compose)
docker compose up -d order-menu
docker compose build order-menu
```

## Swagger

- Local: `http://localhost:8080/swagger-ui.html`
- Docker Compose: `http://localhost:8003/order-menu/swagger-ui.html`
