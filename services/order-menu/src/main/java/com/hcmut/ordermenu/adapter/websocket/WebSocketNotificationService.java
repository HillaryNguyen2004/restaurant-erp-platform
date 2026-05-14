package com.hcmut.ordermenu.adapter.websocket;

import com.hcmut.ordermenu.domain.events.DomainEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import tools.jackson.core.JacksonException;
import tools.jackson.databind.json.JsonMapper;

import java.io.IOException;
import java.util.Collection;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Component
public class WebSocketNotificationService {
    private final JsonMapper jsonMapper = JsonMapper.builder().build();
    private final Map<String, Set<WebSocketSession>> orderSessionsByOrderSessionId = new ConcurrentHashMap<>();
    private final Map<String, Set<WebSocketSession>> orderSessionsByTableId = new ConcurrentHashMap<>();
    private final Set<WebSocketSession> menuSessions = ConcurrentHashMap.newKeySet();
    private final Map<String, SessionRegistration> registrationsBySessionId = new ConcurrentHashMap<>();

    public void registerOrderSession(WebSocketSession session, String orderSessionId, String tableId) {
        orderSessionsByOrderSessionId.computeIfAbsent(orderSessionId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
        if (tableId != null && !tableId.isBlank()) {
            orderSessionsByTableId.computeIfAbsent(tableId, ignored -> ConcurrentHashMap.newKeySet()).add(session);
        }
        registrationsBySessionId.put(session.getId(), SessionRegistration.order(orderSessionId, tableId));
        log.info("order-ws-connected orderSessionId={} tableId={} sessionId={}", orderSessionId, tableId, session.getId());
    }

    public void registerMenuSession(WebSocketSession session) {
        menuSessions.add(session);
        registrationsBySessionId.put(session.getId(), SessionRegistration.forMenu());
        log.info("menu-ws-connected sessionId={}", session.getId());
    }

    public void removeSession(WebSocketSession session) {
        SessionRegistration registration = registrationsBySessionId.remove(session.getId());
        if (registration == null) {
            return;
        }

        if (registration.menuStream()) {
            menuSessions.remove(session);
        }

        if (registration.orderSessionId() != null) {
            removeFromIndex(orderSessionsByOrderSessionId, registration.orderSessionId(), session);
        }
        if (registration.tableId() != null) {
            removeFromIndex(orderSessionsByTableId, registration.tableId(), session);
        }
    }

    public void notifyOrderEvent(DomainEvent event) {
        sendToSessions(recipientSessions(event), event);
    }

    public void notifyMenuEvent(DomainEvent event) {
        sendToSessions(menuSessions, event);
    }

    private Collection<WebSocketSession> recipientSessions(DomainEvent event) {
        Set<WebSocketSession> recipients = new HashSet<>();
        Map<String, Object> payload = event.toPayload();
        String orderSessionId = asString(payload.get("orderSessionId"));
        String tableId = asString(payload.get("tableId"));

        if (!orderSessionId.isBlank()) {
            Set<WebSocketSession> byOrderSession = orderSessionsByOrderSessionId.get(orderSessionId);
            if (byOrderSession != null) {
                recipients.addAll(byOrderSession);
            }
        }
        if (!tableId.isBlank()) {
            Set<WebSocketSession> byTable = orderSessionsByTableId.get(tableId);
            if (byTable != null) {
                recipients.addAll(byTable);
            }
        }

        return recipients;
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
            log.warn("Failed to send websocket message sessionId={}", session.getId(), ex);
            removeSession(session);
        }
    }

    private void removeFromIndex(Map<String, Set<WebSocketSession>> index, String key, WebSocketSession session) {
        Set<WebSocketSession> sessions = index.get(key);
        if (sessions == null) {
            return;
        }

        sessions.remove(session);
        if (sessions.isEmpty()) {
            index.remove(key, sessions);
        }
    }

    private String asString(Object value) {
        return value == null ? "" : String.valueOf(value);
    }

    private record SessionRegistration(String orderSessionId, String tableId, boolean menuStream) {
        private static SessionRegistration order(String orderSessionId, String tableId) {
            return new SessionRegistration(orderSessionId, tableId, false);
        }

        private static SessionRegistration forMenu() {
            return new SessionRegistration(null, null, true);
        }
    }
}
