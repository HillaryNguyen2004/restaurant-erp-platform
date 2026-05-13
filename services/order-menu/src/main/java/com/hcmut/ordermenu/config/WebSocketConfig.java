package com.hcmut.ordermenu.config;

import com.hcmut.ordermenu.adapter.websocket.MenuWebSocketHandler;
import com.hcmut.ordermenu.adapter.websocket.OrderWebSocketHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketConfigurer {
    private final OrderWebSocketHandler orderWebSocketHandler;
    private final MenuWebSocketHandler menuWebSocketHandler;

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(orderWebSocketHandler, "/ws/orders")
                .setAllowedOriginPatterns("*");
        registry.addHandler(menuWebSocketHandler, "/ws/menu")
                .setAllowedOriginPatterns("*");
    }
}
