package com.hcmut.kitchenoperation.adapter;

import com.hcmut.kitchenoperation.domain.events.DomainEvent;
import com.hcmut.kitchenoperation.port.INotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.Collection;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class WebSocketNotificationService implements INotificationService {
    private final JsonMapper jsonMapper = JsonMapper.builder().build();
    private final Map<String, Set<WebSocketSession>> stationSessions = new ConcurrentHashMap<>();
    private final Map<String, String> stationBySessionId = new ConcurrentHashMap<>();

    public void registerStationSession(String stationId, WebSocketSession session) {
        stationSessions.computeIfAbsent(stationId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
        stationBySessionId.put(session.getId(), stationId);
        log.info("kds-ws-connected stationId={} sessionId={}", stationId, session.getId());
    }

    public void removeSession(WebSocketSession session) {
        String stationId = stationBySessionId.remove(session.getId());
        if (stationId == null) {
            return;
        }

        Set<WebSocketSession> sessions = stationSessions.get(stationId);
        if (sessions != null) {
            sessions.remove(session);
            if (sessions.isEmpty()) {
                stationSessions.remove(stationId, sessions);
            }
        }
        log.info("kds-ws-disconnected stationId={} sessionId={}", stationId, session.getId());
    }

    @Override
    public void notifyStation(String stationId, Object message) {
        if (stationId == null || stationId.isBlank()) {
            return;
        }
        sendToSessions(stationSessions.get(stationId), message);
    }

    @Override
    public void notifyStaff(String userId, Object message) {
        log.info("notify-staff userId={} payload={}", userId, message);
    }

    @Override
    public void broadcastToKitchen(Object message) {
        for (Set<WebSocketSession> sessions : stationSessions.values()) {
            sendToSessions(sessions, message);
        }
    }

    private void sendToSessions(Collection<WebSocketSession> sessions, Object message) {
        if (sessions == null || sessions.isEmpty()) {
            return;
        }

        TextMessage textMessage = toTextMessage(message);
        if (textMessage == null) {
            return;
        }

        for (WebSocketSession session : sessions) {
            send(session, textMessage);
        }
    }

    private TextMessage toTextMessage(Object message) {
        try {
            return new TextMessage(jsonMapper.writeValueAsString(toWirePayload(message)));
        } catch (JacksonException ex) {
            log.error("Failed to serialize websocket payload", ex);
            return null;
        }
    }

    private Object toWirePayload(Object message) {
        if (message instanceof DomainEvent event) {
            Map<String, Object> envelope = new LinkedHashMap<>();
            envelope.put("eventId", event.getEventId().toString());
            envelope.put("eventType", event.getEventType());
            envelope.put("occurredAt", event.getOccurredAt().toString());
            envelope.put("aggregateId", event.getAggregateId());
            envelope.put("data", event.toPayload());
            return envelope;
        }
        return message;
    }

    private void send(WebSocketSession session, TextMessage message) {
        if (!session.isOpen()) {
            removeSession(session);
            return;
        }

        try {
            synchronized (session) {
                session.sendMessage(message);
            }
        } catch (IOException ex) {
            log.warn("Failed to send kds websocket message sessionId={}", session.getId(), ex);
            removeSession(session);
        }
    }
}
