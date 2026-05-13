"use client"

import { CONFIG } from "@/lib/config"
import { useQueryClient } from "@tanstack/react-query"
import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
} from "react"

type RealtimeData = Record<string, unknown>

type RealtimeEnvelope = {
  type?: string
  event?: string
  eventType?: string
  data?: RealtimeData
}

interface RealtimeContextType {
  emit: (event: string, data: unknown) => void
  processEvent: (event: string, data?: RealtimeData) => void
}

const HEARTBEAT_INTERVAL_MS = 25000
const RECONNECT_DELAY_MS = 2000

const RealtimeContext = createContext<RealtimeContextType | undefined>(
  undefined
)

function queryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value) search.set(key, value)
  })
  const value = search.toString()
  return value ? `?${value}` : ""
}

function eventName(envelope: RealtimeEnvelope) {
  return envelope.eventType ?? envelope.event ?? ""
}

export function RealtimeProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const processEvent = useCallback(
    (event: string, data: RealtimeData = {}) => {
      window.dispatchEvent(
        new CustomEvent("realtime_event", { detail: { event, data } })
      )

      switch (event) {
        case "kitchen.ticket.created":
        case "kitchen.ticket.status.changed":
        case "kitchen.ticket.alert.triggered":
        case "NEW_TICKET_CREATED":
          queryClient.invalidateQueries({ queryKey: ["tickets"] })
          break
        case "order.placed":
        case "order.item.updated":
        case "order.cancelled":
        case "order.status.changed":
        case "NEW_ORDER_PLACED":
        case "ORDER_STATUS_UPDATED":
          queryClient.invalidateQueries({ queryKey: ["orders"] })
          queryClient.invalidateQueries({ queryKey: ["tables"] })
          break
        case "order.session.started":
        case "order.session.closed":
        case "order.session.cancelled":
          queryClient.invalidateQueries({ queryKey: ["orders"] })
          queryClient.invalidateQueries({ queryKey: ["tables"] })
          window.setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ["orders"] })
            queryClient.invalidateQueries({ queryKey: ["tables"] })
          }, 1200)
          break
        case "table.state-changed":
        case "dining-session.started":
        case "dining-session.extended":
        case "dining-session.finished":
        case "TABLE_STATUS_CHANGED":
          queryClient.invalidateQueries({ queryKey: ["tables"] })
          break
        default:
          if (event.startsWith("menu.") || event.startsWith("promotion.")) {
            queryClient.invalidateQueries({ queryKey: ["menu"] })
          }
          break
      }
    },
    [queryClient]
  )

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== "realtime_event" || !event.newValue) return

      try {
        const envelope = JSON.parse(event.newValue) as RealtimeEnvelope
        const name = eventName(envelope)
        if (name) processEvent(name, envelope.data)
      } catch (error) {
        console.error("[Realtime] Failed to parse mock event", error)
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [processEvent])

  const emit = useCallback(
    (event: string, data: unknown) => {
      const payload = {
        event,
        data,
        timestamp: Date.now(),
      }

      localStorage.setItem("realtime_event", JSON.stringify(payload))
      processEvent(event, data as RealtimeData)
    },
    [processEvent]
  )

  return (
    <RealtimeContext.Provider value={{ emit, processEvent }}>
      {children}
    </RealtimeContext.Provider>
  )
}

export function useRealtime() {
  const context = useContext(RealtimeContext)
  if (context === undefined) {
    throw new Error("useRealtime must be used within a RealtimeProvider")
  }
  return context
}

function useRealtimeSocket(path: string | null) {
  const { processEvent } = useRealtime()

  useEffect(() => {
    if (CONFIG.IS_MOCK || !path) return

    let socket: WebSocket | null = null
    let heartbeatTimer: ReturnType<typeof setInterval> | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let closedByEffect = false

    const stopHeartbeat = () => {
      if (heartbeatTimer) {
        clearInterval(heartbeatTimer)
        heartbeatTimer = null
      }
    }

    const startHeartbeat = () => {
      stopHeartbeat()
      heartbeatTimer = setInterval(() => {
        if (socket?.readyState === WebSocket.OPEN) {
          socket.send('{"type":"ping"}')
        }
      }, HEARTBEAT_INTERVAL_MS)
    }

    const connect = () => {
      socket = new WebSocket(`${CONFIG.WS_URL}${path}`)

      socket.onopen = startHeartbeat

      socket.onmessage = (message) => {
        try {
          const envelope = JSON.parse(message.data) as RealtimeEnvelope
          if (envelope.type === "pong") return

          const name = eventName(envelope)
          if (name) processEvent(name, envelope.data)
        } catch (error) {
          console.error("[Realtime] Failed to parse WebSocket message", error)
        }
      }

      socket.onerror = (error) => {
        console.error("[Realtime] WebSocket error", error)
      }

      socket.onclose = () => {
        stopHeartbeat()
        if (!closedByEffect) {
          reconnectTimer = setTimeout(connect, RECONNECT_DELAY_MS)
        }
      }
    }

    connect()

    return () => {
      closedByEffect = true
      stopHeartbeat()
      if (reconnectTimer) clearTimeout(reconnectTimer)
      socket?.close()
    }
  }, [path, processEvent])
}

export function useKdsStationRealtime(stationId: string | undefined) {
  useRealtimeSocket(
    stationId
      ? `/kitchen-operation/ws/kds${queryString({ stationId })}`
      : null
  )
}

export function useOrderSessionRealtime(
  orderSessionId: string | undefined,
  tableId?: string
) {
  useRealtimeSocket(
    orderSessionId
      ? `/order-menu/ws/orders${queryString({ orderSessionId, tableId })}`
      : null
  )
}

export function useMenuRealtime() {
  useRealtimeSocket("/order-menu/ws/menu")
}

/**
 * Subscribe to the restaurant-wide table state stream.
 *
 * Used by screens that display the full table grid (e.g. /billing, /tables)
 * so they can drop REST polling and stay in sync via server push.
 *
 * Expected backend endpoint: `WS /table-reservation/ws/tables`
 * Expected event types (from the table-reservation service):
 *   - `table.state-changed`
 *   - `dining-session.started`
 *   - `dining-session.extended`
 *   - `dining-session.finished`
 *
 * All of the above invalidate the `["tables"]` query in `processEvent`.
 */
export function useTablesRealtime() {
  useRealtimeSocket("/table-reservation/ws/tables")
}
