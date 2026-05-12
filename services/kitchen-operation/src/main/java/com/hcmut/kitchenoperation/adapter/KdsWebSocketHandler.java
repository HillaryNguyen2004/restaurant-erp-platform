package com.hcmut.kitchenoperation.adapter;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
public class KdsWebSocketHandler extends TextWebSocketHandler {
    private final WebSocketNotificationService notificationService;

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        String stationId = stationId(session);
        if (stationId == null || stationId.isBlank()) {
            session.close(new CloseStatus(1008, "stationId query parameter is required"));
            return;
        }
        notificationService.registerStationSession(stationId, session);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        notificationService.removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        notificationService.removeSession(session);
    }

    private String stationId(WebSocketSession session) {
        if (session.getUri() == null) {
            return null;
        }
        return UriComponentsBuilder.fromUri(session.getUri())
                .build()
                .getQueryParams()
                .getFirst("stationId");
    }
}
