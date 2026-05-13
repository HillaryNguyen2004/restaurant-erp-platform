"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { useAuth } from "@/features/auth/components/auth-provider"
import {
  KitchenTicketStatus,
  getUrgencyLevel,
  sortTicketsByPriority,
} from "@/features/kds/config/kds.config"
import {
  useStations,
  useTickets,
  useUpdateTicketStatus,
} from "@/features/kds/data-access/kds.queries"
import { useKdsStationRealtime } from "@/providers/realtime-provider"
import { AlertTriangle, ChefHat, Clock, LogOut } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

function getTodayKey() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function getStationStorageKey(userId: string) {
  return `kds:selected-station:${userId}:${getTodayKey()}`
}

function getInitialStationSelection() {
  if (typeof window === "undefined") {
    return { stationId: "", storageKey: null as string | null }
  }

  try {
    const savedAuth = localStorage.getItem("auth_user")
    if (!savedAuth) return { stationId: "", storageKey: null }

    const savedUser = JSON.parse(savedAuth) as { user?: { id?: string } }
    const userId = savedUser.user?.id
    if (!userId) return { stationId: "", storageKey: null }

    const storageKey = getStationStorageKey(userId)
    return {
      stationId: localStorage.getItem(storageKey) ?? "",
      storageKey,
    }
  } catch {
    return { stationId: "", storageKey: null }
  }
}

export default function KDSPage() {
  const { user, logout } = useAuth()
  const [initialSelection] = useState(getInitialStationSelection)
  const [selectedStationId, setSelectedStationId] = useState(
    initialSelection.stationId
  )
  const [, setTick] = useState(0)

  const stationStorageKey = user?.id
    ? getStationStorageKey(user.id)
    : initialSelection.storageKey

  const {
    data: stations = [],
    isError: isStationsError,
    isLoading: isLoadingStations,
  } = useStations()
  const selectedStation = stations.find(
    (station) => station.stationId === selectedStationId
  )
  useKdsStationRealtime(selectedStation?.stationId)
  const {
    data: tickets,
    isError: isTicketsError,
    isLoading: isLoadingTickets,
  } = useTickets(selectedStation?.stationId)
  const mutation = useUpdateTicketStatus()

  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const activeTickets = useMemo(
    () =>
      sortTicketsByPriority(
        (tickets ?? []).filter(
          (ticket) =>
            ticket.status !== "COMPLETED" && ticket.status !== "CANCELLED"
        )
      ),
    [tickets]
  )

  const getNextStatus = (
    status: KitchenTicketStatus
  ): KitchenTicketStatus | null => {
    if (status === "PENDING") return "IN_PROGRESS"
    if (status === "IN_PROGRESS") return "READY"
    if (status === "READY") return "COMPLETED"
    return null
  }

  const getNextLabel = (status: KitchenTicketStatus) => {
    if (status === "PENDING") return "Start Cooking"
    if (status === "IN_PROGRESS") return "Mark Ready"
    if (status === "READY") return "Complete"
    return null
  }

  const updateTicket = (ticketId: string, status: KitchenTicketStatus) => {
    mutation.mutate({
      ticketId,
      status,
      changedByUserId: user?.id ?? "STAFF_ID",
    })
  }

  const handleStationChange = (stationId: string) => {
    setSelectedStationId(stationId)
    if (stationStorageKey && stationId) {
      localStorage.setItem(stationStorageKey, stationId)
    }
  }

  const urgencyConfig = {
    critical: {
      card: "border-red-400 bg-red-950/30",
      badge: "bg-red-500 text-white",
      timer: "text-red-400 animate-pulse",
      icon: <AlertTriangle className="h-3.5 w-3.5" />,
      label: "URGENT",
    },
    warning: {
      card: "border-amber-400 bg-amber-950/20",
      badge: "bg-amber-500 text-white",
      timer: "text-amber-400",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: "SOON",
    },
    normal: {
      card: "border-slate-700 bg-slate-800/50",
      badge: "bg-slate-600 text-white",
      timer: "text-slate-400",
      icon: <Clock className="h-3.5 w-3.5" />,
      label: null,
    },
  }

  return (
    <div className="container mx-auto p-8">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-white uppercase italic">
              Kitchen Display
            </h2>
            <p className="text-sm text-slate-400">
              {selectedStation
                ? `${selectedStation.name} - ${activeTickets.length} active ticket${activeTickets.length !== 1 ? "s" : ""}`
                : "Choose a station to load tickets"}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-2">
              <ChefHat className="h-4 w-4 text-slate-400" />
              <span className="text-sm font-medium text-slate-300">
                Station
              </span>
              <NativeSelect
                aria-label="Kitchen station"
                className="w-52"
                disabled={isLoadingStations || isStationsError}
                value={selectedStation?.stationId ?? ""}
                onChange={(event) => handleStationChange(event.target.value)}
              >
                <NativeSelectOption value="" disabled>
                  Select station
                </NativeSelectOption>
                {stations.map((station) => (
                  <NativeSelectOption
                    key={station.stationId}
                    value={station.stationId}
                  >
                    {station.name}
                    {station.active ? "" : " (inactive)"}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="text-slate-400"
              aria-label="Logout"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {isLoadingStations && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            Loading stations...
          </div>
        )}

        {isStationsError && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            Unable to load kitchen stations
          </div>
        )}

        {!isLoadingStations && !isStationsError && stations.length === 0 && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            No kitchen stations available
          </div>
        )}

        {!isLoadingStations &&
          !isStationsError &&
          stations.length > 0 &&
          !selectedStation && (
            <div className="flex h-64 items-center justify-center text-slate-400">
              Choose a station to load tickets
            </div>
          )}

        {selectedStation && isLoadingTickets && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            Loading tickets...
          </div>
        )}

        {selectedStation && isTicketsError && (
          <div className="flex h-64 items-center justify-center text-slate-400">
            Unable to load tickets for this station
          </div>
        )}

        {selectedStation &&
          !isLoadingTickets &&
          !isTicketsError &&
          activeTickets.length === 0 && (
            <div className="flex h-64 flex-col items-center justify-center text-slate-500">
              <p className="font-medium">No active tickets for this station</p>
            </div>
          )}

        {selectedStation && !isLoadingTickets && !isTicketsError && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {activeTickets.map((ticket) => {
              const urgency = getUrgencyLevel(ticket)
              const config = urgencyConfig[urgency]
              const nextStatus = getNextStatus(ticket.status)
              const nextLabel = getNextLabel(ticket.status)
              const totalMinutes = Math.max(
                ticket.elapsedMinutes + ticket.remainingMinutes,
                1
              )
              const progress = Math.min(
                (ticket.elapsedMinutes / totalMinutes) * 100,
                100
              )

              return (
                <Card
                  key={ticket.ticketId}
                  className={`border-2 transition-all duration-300 ${config.card}`}
                >
                  <CardHeader className="space-y-2 p-4 pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-white">
                        Table {ticket.tableNumber}
                      </CardTitle>
                      {config.label && (
                        <Badge
                          className={`gap-1 text-xs font-bold ${config.badge}`}
                        >
                          {config.icon}
                          {config.label}
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div
                        className={`flex items-center gap-1.5 text-xs font-bold ${config.timer}`}
                      >
                        {config.icon}
                        Waiting: {ticket.elapsedMinutes}m / {totalMinutes}m
                        est.
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-slate-700">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-1000 ${
                            urgency === "critical"
                              ? "bg-red-500"
                              : urgency === "warning"
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                          }`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <Badge
                      variant="outline"
                      className="w-fit border-slate-600 text-xs text-slate-300"
                    >
                      {ticket.status.replace("_", " ")}
                    </Badge>
                  </CardHeader>

                  <CardContent className="p-4 pt-2">
                    <ul className="space-y-1">
                      {ticket.items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm">
                          <span className="text-slate-200">
                            {item.menuItemName}
                          </span>
                          <span className="font-mono text-slate-400">
                            x{item.quantity}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter className="flex gap-2 p-4 pt-0">
                    {nextStatus && nextLabel && (
                      <Button
                        className="h-9 flex-1 text-xs font-bold"
                        disabled={mutation.isPending}
                        onClick={() => updateTicket(ticket.ticketId, nextStatus)}
                      >
                        {nextLabel}
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 border-slate-600 text-xs text-slate-400"
                      onClick={() =>
                        updateTicket(ticket.ticketId, "CANCELLED")
                      }
                      disabled={mutation.isPending}
                    >
                      Cancel
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
