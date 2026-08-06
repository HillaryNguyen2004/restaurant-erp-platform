import {
  Injectable,
  Logger,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import fastifyWebsocket, { WebSocket } from '@fastify/websocket';
import type { FastifyInstance, FastifyRequest } from 'fastify';

/**
 * Envelope shape broadcast to connected WebSocket clients.
 *
 * This mirrors the Kafka event envelope produced by
 * `EventPublisherAdapter.publish(...)`, so the frontend can read
 * `eventType` / `data` directly (see `useRealtimeSocket` in
 * intelligent-restaurant-fe/providers/realtime-provider.tsx).
 */
export interface TableWsEventEnvelope {
  eventId?: string;
  eventType: string;
  occurredAt?: string;
  aggregateId?: string;
  data: Record<string, unknown>;
}

const WS_ROUTE = '/ws/tables';
const PONG_FRAME = '{"type":"pong"}';
const WS_OPEN_STATE = 1; // ws.WebSocket.OPEN

/**
 * Fastify-backed WebSocket gateway exposing `GET /ws/tables`.
 *
 * Responsibilities:
 *   - Register the `@fastify/websocket` plugin on the underlying Fastify
 *     instance (NestJS uses FastifyAdapter in main.ts).
 *   - Track connected clients and reply to `{"type":"ping"}` with
 *     `{"type":"pong"}` per docs/websocket-endpoints.md.
 *   - Expose a `broadcast(envelope)` method used by
 *     `TableEventsKafkaConsumer` to fan out Kafka events.
 *
 * The plugin + route are registered inside `onModuleInit`, which fires
 * before `app.listen(...)` in `main.ts`, so Fastify accepts both the
 * plugin and the WS-enabled route before `ready()` is triggered.
 */
@Injectable()
export class TableWsGateway implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(TableWsGateway.name);
  private readonly clients = new Set<WebSocket>();

  constructor(private readonly adapterHost: HttpAdapterHost) {}

  async onModuleInit(): Promise<void> {
    const httpAdapter = this.adapterHost.httpAdapter;
    if (!httpAdapter) {
      this.logger.error(
        'HttpAdapter is not available; skipping WebSocket registration',
      );
      return;
    }

    const fastify = httpAdapter.getInstance<FastifyInstance>();

    await fastify.register(fastifyWebsocket);

    fastify.get(
      WS_ROUTE,
      { websocket: true },
      (socket: WebSocket, request: FastifyRequest) => {
        this.handleConnection(socket, request);
      },
    );

    this.logger.log(`Registered WebSocket route: ${WS_ROUTE}`);
  }

  onApplicationShutdown(): void {
    for (const client of this.clients) {
      try {
        client.close();
      } catch {
        // ignore: socket may already be closed
      }
    }
    this.clients.clear();
  }

  /**
   * Fan the given envelope out to every connected, open WebSocket client.
   * Dead / errored sockets are pruned from the client set.
   */
  broadcast(envelope: TableWsEventEnvelope): void {
    if (this.clients.size === 0) return;

    const payload = JSON.stringify(envelope);

    for (const client of this.clients) {
      if (client.readyState !== WS_OPEN_STATE) {
        this.clients.delete(client);
        continue;
      }

      try {
        client.send(payload);
      } catch (err) {
        this.logger.warn(
          `Failed to send event to client; removing. ${(err as Error).message}`,
        );
        this.clients.delete(client);
      }
    }
  }

  private handleConnection(socket: WebSocket, request: FastifyRequest): void {
    // A plain (non-upgrade) GET on this route makes @fastify/websocket invoke
    // the handler in HTTP mode, where `socket` is a FastifyRequest rather than
    // a WebSocket. Bail out instead of throwing on `socket.on`.
    if (typeof socket?.on !== 'function') {
      this.logger.warn(
        `Ignoring non-WebSocket request on ${WS_ROUTE} (missing Upgrade header)`,
      );
      return;
    }

    this.clients.add(socket);
    this.logger.log(
      `WS client connected from ${request.ip}; total=${this.clients.size}`,
    );

    socket.on('message', (raw) => {
      // Only the heartbeat ping is supported per docs/websocket-endpoints.md.
      // All other frames are ignored.
      try {
        const text =
          typeof raw === 'string' ? raw : Buffer.from(raw as Buffer).toString();
        if (!text) return;

        const parsed = JSON.parse(text) as { type?: string };
        if (parsed?.type === 'ping') {
          socket.send(PONG_FRAME);
        }
      } catch {
        // Ignore malformed client messages silently.
      }
    });

    socket.on('close', () => {
      this.clients.delete(socket);
      this.logger.log(
        `WS client disconnected; total=${this.clients.size}`,
      );
    });

    socket.on('error', (err) => {
      this.logger.warn(`WS client error: ${err.message}`);
      this.clients.delete(socket);
    });
  }
}
