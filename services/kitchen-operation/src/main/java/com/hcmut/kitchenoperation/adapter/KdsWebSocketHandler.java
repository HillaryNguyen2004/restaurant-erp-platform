package com.hcmut.kitchenoperation.adapter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.web.util.UriComponentsBuilder;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.json.JsonMapper;

@Component
@RequiredArgsConstructor
@Slf4j
public class KdsWebSocketHandler extends TextWebSocketHandler {
    private final WebSocketNotificationService notificationService;
    private final JsonMapper jsonMapper;

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
    protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        String payload = message.getPayload();

        if (isPingMessage(payload)) {
            session.sendMessage(new TextMessage("{\"type\":\"pong\"}"));
            return;
        }

        log.warn("kds-ws-ignored-client-message sessionId={} payload={}", session.getId(), payload);
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        notificationService.removeSession(session);
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) {
        log.error("kds-ws-transport-error sessionId={}", session.getId(), exception);
        notificationService.removeSession(session);
    }

    private boolean isPingMessage(String payload) {
        try {
            JsonNode root = jsonMapper.readTree(payload);

            return root.has("type")
                    && "ping".equals(root.get("type").asString())
                    && root.size() == 1;
        } catch (Exception ex) {
            return false;
        }
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