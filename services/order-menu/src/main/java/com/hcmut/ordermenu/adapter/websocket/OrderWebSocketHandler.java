package com.hcmut.ordermenu.adapter.websocket;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class OrderWebSocketHandler extends TextWebSocketHandler {
    private final WebSocketNotificationService notificationService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String orderSessionId = queryParam(session, "orderSessionId");
        String tableId = queryParam(session, "tableId");
        if (orderSessionId == null || orderSessionId.isBlank()) {
            session.close(new CloseStatus(1008, "orderSessionId query parameter is required"));
            return;
        }
        notificationService.registerOrderSession(session, orderSessionId, tableId);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        notificationService.removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        notificationService.removeSession(session);
    }

    private String queryParam(WebSocketSession session, String name) {
        if (session.getUri() == null) {
            return null;
        }
        return UriComponentsBuilder.fromUri(session.getUri())
                .build()
                .getQueryParams()
                .getFirst(name);
    }
}
