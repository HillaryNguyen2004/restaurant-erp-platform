package com.hcmut.ordermenu.adapter.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

@Component
@RequiredArgsConstructor
public class MenuWebSocketHandler extends TextWebSocketHandler {
    private final WebSocketNotificationService notificationService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) {
        notificationService.registerMenuSession(session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        notificationService.removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        notificationService.removeSession(session);
    }
}
