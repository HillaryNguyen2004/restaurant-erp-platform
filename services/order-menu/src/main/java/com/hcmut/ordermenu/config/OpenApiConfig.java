package com.hcmut.ordermenu.config;

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
    OpenAPI orderMenuOpenApi(@Value("${app.openapi.server-url:/order-menu}") String serverUrl) {
        return new OpenAPI()
                .servers(List.of(new Server()
                        .url(serverUrl)
                        .description("Order Menu API base path")))
                .info(new Info()
                        .title("Order Menu API")
                        .version("v1")
                        .description("APIs for menu management, promotions, order sessions, and order placement."));
    }
}
