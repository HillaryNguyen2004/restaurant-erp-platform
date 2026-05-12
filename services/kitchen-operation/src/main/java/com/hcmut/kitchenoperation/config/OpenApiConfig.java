package com.hcmut.kitchenoperation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI kitchenOperationOpenApi(@Value("${app.openapi.server-url:/kitchen-operation}") String serverUrl) {
        return new OpenAPI()
                .servers(List.of(new Server()
                        .url(serverUrl)
                        .description("Kitchen Operation API base path")))
                .info(new Info()
                        .title("Kitchen Operation API")
                        .version("v1")
                        .description("APIs for routing orders, kitchen tickets, station dashboards, and course firing."));
    }
}
