package com.hcmut.ordermenu.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI orderMenuOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Order Menu API")
                        .version("v1")
                        .description("APIs for menu management, promotions, order sessions, and order placement."));
    }
}
