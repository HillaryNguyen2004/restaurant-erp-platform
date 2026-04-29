package com.hcmut.kitchenoperation.config;

import org.flywaydb.core.Flyway;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

@Component
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class FlywayMigrationRunner {
    private final SqlConnectionFactory connectionFactory;

    public FlywayMigrationRunner(SqlConnectionFactory connectionFactory) {
        this.connectionFactory = connectionFactory;
        migrate();
    }

    private void migrate() {
        Flyway.configure()
                .dataSource(connectionFactory.getUrl(), connectionFactory.getUsername(), connectionFactory.getPassword())
                .schemas(connectionFactory.getSchema())
                .defaultSchema(connectionFactory.getSchema())
                .createSchemas(true)
                .locations("classpath:db/migration/kitchen-operation")
                .load()
                .migrate();
    }
}
