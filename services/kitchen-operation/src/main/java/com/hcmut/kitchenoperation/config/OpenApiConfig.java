package com.hcmut.kitchenoperation.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI kitchenOperationOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("Kitchen Operation API")
                        .version("v1")
                        .description("APIs for routing orders, kitchen tickets, station dashboards, and course firing."));
    }
}
