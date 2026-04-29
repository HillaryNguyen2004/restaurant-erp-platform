# Kitchen Operation Service

## Commands

```bash
# from services/kitchen-operation
./gradlew bootRun            # run local (default: in-memory persistence)
./gradlew build              # build
./gradlew test               # test
```

```bash
# from repo root (run with Kafka + Postgres via docker-compose)
docker compose up -d kitchen-operation
docker compose build kitchen-operation
```

## Swagger

- Local: `http://localhost:8080/swagger-ui.html`
- Docker Compose: `http://localhost:8082/swagger-ui.html`
