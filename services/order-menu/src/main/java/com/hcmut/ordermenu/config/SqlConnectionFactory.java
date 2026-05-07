package com.hcmut.ordermenu.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

@Component
@ConditionalOnProperty(name = "app.persistence.type", havingValue = "sql")
public class SqlConnectionFactory {
    private final String url;
    private final String username;
    private final String password;
    private final String schema;

    public SqlConnectionFactory(
            @Value("${app.db.url}") String url,
            @Value("${app.db.username}") String username,
            @Value("${app.db.password}") String password,
            @Value("${app.db.schema}") String schema
    ) {
        this.url = url;
        this.username = username;
        this.password = password;
        this.schema = schema;
    }

    public Connection getConnection() throws SQLException {
        Connection connection = DriverManager.getConnection(url, username, password);
        connection.setSchema(schema);
        return connection;
    }

    public String getUrl() {
        return url;
    }

    public String getUsername() {
        return username;
    }

    public String getPassword() {
        return password;
    }

    public String getSchema() {
        return schema;
    }
}
