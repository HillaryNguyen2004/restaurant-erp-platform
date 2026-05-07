"use client"

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  KitchenTicket,
  KitchenTicketStatus,
  getWaitingMinutes,
  getUrgencyLevel,
  sortTicketsByPriority,
} from "@/features/kds/config/kds.config"
import { useRealtime } from "@/providers/realtime-provider"
import { toast } from "sonner"
import { useAuth } from "@/features/auth/components/auth-provider"
import { Clock, AlertTriangle, LogOut, ReceiptText } from "lucide-react"
import { useEffect, useState } from "react"
import { kdsQueries } from "@/features/kds/data-access/kds.queries"

export default function KDSPage() {
  const { emit } = useRealtime()
  const { logout } = useAuth()

  const [, setTick] = useState(0)
  const [selectedTicket, setSelectedTicket] = useState<KitchenTicket | null>(
    null
  )
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  const { data: tickets, isLoading } = kdsQueries.useTickets()
  const mutation = kdsQueries.useUpdateTicketStatus()
  const updateTicketStatus = (
    input: {
      id: string
      status: KitchenTicketStatus
    }
  ) =>
    mutation.mutate(input, {
      onSuccess: (data) => {
        emit("ORDER_STATUS_UPDATED", {
          orderId: data.orderId,
          status: data.status,
        })
        toast.success(`Ticket updated to ${data.status}`)
      },
    })

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center text-slate-400">
        Loading tickets...
      </div>
    )

  const activeTickets = sortTicketsByPriority(tickets ?? [])

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white uppercase italic">
              Kitchen Display
            </h2>
            <p className="text-sm text-slate-400">
              {activeTickets.length} active ticket
              {activeTickets.length !== 1 ? "s" : ""} — sorted by urgency
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={logout}
            className="text-slate-400"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>

      {activeTickets.length === 0 && (
        <div className="flex h-64 flex-col items-center justify-center text-slate-500">
          <span className="mb-3 text-5xl">🍽️</span>
          <p className="font-medium">No active tickets</p>
        </div>
      )}

      {/* Ticket grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {activeTickets.map((ticket) => {
          const urgency = getUrgencyLevel(ticket)
          const waited = getWaitingMinutes(ticket.createdAt)
          const config = urgencyConfig[urgency]
          const nextStatus = getNextStatus(ticket.status)
          const nextLabel = getNextLabel(ticket.status)

          return (
            <Card
              key={ticket.ticketId}
              className={`border-2 transition-all duration-300 ${config.card}`}
            >
              <CardHeader className="space-y-2 p-4 pb-2">
                {/* Ticket + urgency */}
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white">
                    Ticket {ticket.tableNumber}
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

                {/* Waiting time bar */}
                <div className="space-y-1">
                  <div
                    className={`flex items-center gap-1.5 text-xs font-bold ${config.timer}`}
                  >
                    {config.icon}
                    Waiting: {waited}m / {ticket.elapsedMinutes + ticket.remainingMinutes}m est.
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-700">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-1000 ${
                        urgency === "critical"
                          ? "bg-red-500"
                          : urgency === "warning"
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                      }`}
                      style={{
                        width: `${Math.min((waited / (ticket.elapsedMinutes + ticket.remainingMinutes || 1)) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Status badge */}
                <Badge
                  variant="outline"
                  className="w-fit border-slate-600 text-xs text-slate-300"
                >
                  {ticket.status.replace("_", " ")}
                </Badge>
              </CardHeader>

              {/* Items list */}
              <CardContent className="p-4 pt-2">
                <ul className="space-y-1">
                  {ticket.items.map((item, idx) => (
                    <li key={`${item.menuItemName}-${idx}`} className="flex justify-between text-sm">
                      <span className="text-slate-200">
                        {item.menuItemName}
                      </span>
                      <span className="font-mono text-slate-400">
                        ×{item.quantity}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              {/* Action button */}
              <CardFooter className="flex gap-2 p-4 pt-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-slate-600 text-xs text-slate-300"
                  onClick={() => setSelectedTicket(ticket)}
                >
                  <ReceiptText className="mr-1.5 h-3.5 w-3.5" />
                  View
                </Button>
                {nextStatus && nextLabel && (
                  <Button
                    className="h-9 flex-1 text-xs font-bold"
                    disabled={mutation.isPending}
                    onClick={() =>
                      updateTicketStatus({ id: ticket.ticketId, status: nextStatus })
                    }
                  >
                    {nextLabel}
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 border-slate-600 text-xs text-slate-400"
                  onClick={() =>
                    updateTicketStatus({ id: ticket.ticketId, status: "CANCELLED" })
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

      <Sheet
        open={!!selectedTicket}
        onOpenChange={(open) => !open && setSelectedTicket(null)}
      >
        <SheetContent className="w-full overflow-y-auto sm:max-w-md">
          {selectedTicket && (
            <>
              <SheetHeader>
                <SheetTitle>Ticket {selectedTicket.tableNumber}</SheetTitle>
                <SheetDescription>
                  Order #{selectedTicket.orderId.slice(-8)} · Ticket #
                  {selectedTicket.ticketId.slice(-8)}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-5 px-4 pb-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge
                      variant="outline"
                      className="mt-1 border-slate-600 text-slate-200"
                    >
                      {selectedTicket.status.replace("_", " ")}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-slate-500">Station</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {selectedTicket.stationName ??
                        selectedTicket.stationId ??
                        "Kitchen"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Course</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {selectedTicket.courseType ?? "MAIN"}
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-500">Waiting</p>
                    <p className="mt-1 font-medium text-slate-100">
                      {getWaitingMinutes(selectedTicket.createdAt)}m /{" "}
                      {selectedTicket.elapsedMinutes + selectedTicket.remainingMinutes}m
                    </p>
                  </div>
                </div>

                {selectedTicket.specialInstructions && (
                  <div className="rounded-lg border border-slate-700 p-3">
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-500">
                      Ticket Notes
                    </p>
                    <p className="text-sm text-slate-200">
                      {selectedTicket.specialInstructions}
                    </p>
                  </div>
                )}

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-100">
                      Items To Make
                    </p>
                    <Badge variant="outline" className="border-slate-700">
                      {selectedTicket.items.reduce(
                        (sum, item) => sum + item.quantity,
                        0
                      )}{" "}
                      items
                    </Badge>
                  </div>

                  {selectedTicket.items.map((item, idx) => (
                    <div
                      key={`${item.menuItemName}-${idx}`}
                      className="rounded-lg border border-slate-800 bg-slate-950/60 p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-100">
                            {item.menuItemName}
                          </p>
                          {item.allergyTags && item.allergyTags.length > 0 && (
                            <div className="mt-1 flex flex-wrap gap-1">
                              {item.allergyTags.map(tag => (
                                <Badge key={tag} className="bg-red-500/20 text-red-400 border-red-500/50 text-[10px] px-1 py-0">{tag}</Badge>
                              ))}
                            </div>
                          )}
                          {item.specialInstructions && (
                            <p className="mt-1 text-xs text-amber-300">
                              {item.specialInstructions}
                            </p>
                          )}
                        </div>
                        <span className="font-mono text-sm text-slate-300">
                          x{item.quantity}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  </div>
)
}
