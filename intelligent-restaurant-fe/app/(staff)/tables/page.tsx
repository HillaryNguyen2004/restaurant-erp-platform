"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/components/auth-provider"
import { TableDetailSheet } from "@/features/table-management/components/table-detail-sheet"
import {
  Table,
  TableStatus,
} from "@/features/table-management/config/table.config"
import { useStartSession, useTables, useUpdateTableStatus } from "@/features/table-management/data-access/table.queries"
import { useTablesRealtime } from "@/providers/realtime-provider"
import { LogOut } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

export default function TablesPage() {
  const { logout, user } = useAuth()
  const role = user?.roles?.[0]
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [readyTables, setReadyTables] = useState<Set<string>>(new Set())

  // Disable REST polling; table state is streamed via WebSocket below.
  const { data: tables, isLoading } = useTables({ enablePolling: false })
  const startSessionMutation = useStartSession()
  const statusMutation = useUpdateTableStatus()

  // Open a realtime channel for restaurant-wide table state updates.
  // The RealtimeProvider invalidates the `["tables"]` query on relevant
  // events (table.state-changed, dining-session.*), keeping the grid live.
  useTablesRealtime()

  // Listen for realtime order updates
  useEffect(() => {
    const handler = (e: any) => {
      const { event, data } = e.detail;
      if (event === 'ORDER_STATUS_UPDATED') {
        if (data.status === 'READY') {
          setReadyTables(prev => new Set(prev).add(data.tableNumber));
          toast(`Order Ready for Table ${data.tableNumber}!`, {
            icon: "🔔",
            description: "Ready to be served."
          });
        } else if (data.status === 'SERVED' || data.status === 'PAID') {
          setReadyTables(prev => {
            const next = new Set(prev);
            next.delete(data.tableNumber);
            return next;
          });
        }
      } else if (event === 'TABLE_STATUS_CHANGED') {
        // Clear notifications if table becomes available
        if (data.status === 'AVAILABLE') {
          setReadyTables(prev => {
            const next = new Set(prev);
            next.delete(data.tableNumber);
            return next;
          });
        }
      }
    };

    window.addEventListener('realtime_event', handler);
    return () => window.removeEventListener('realtime_event', handler);
  }, []);

  if (isLoading) return <div className="p-8 text-center font-bold">Loading Table Map...</div>

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "FREE":
        return "bg-emerald-500 hover:bg-emerald-600"
      case "OCCUPIED":
        return "bg-rose-500 hover:bg-rose-600"
      case "RESERVED":
        return "bg-amber-500 hover:bg-amber-600"
      case "OUT_OF_ORDER":
        return "bg-slate-500"
      default:
        return "bg-slate-500"
    }
  }

  const isServer = role === "SERVER" || role === "TABLE_STAFF" || role === "ADMIN"
  const isCashier = role === "CASHIER" || role === "ADMIN"

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-slate-900">
            {isCashier && !isServer ? "Billing Dashboard" : "Table Management"}
          </h1>
          <p className="text-slate-500 font-medium">Logged in as {role}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="secondary" className="px-4 py-2 text-base font-bold shadow-sm">
            {tables?.filter((t) => t.status === "FREE").length ?? 0} Available
          </Badge>
          <Button
            variant="outline"
            size="icon"
            className="rounded-full border-2 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 transition-colors"
            onClick={() => logout()}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables?.map((table) => (
          <Card
            key={table.tableId}
            className={`group relative overflow-hidden border-2 transition-all cursor-pointer hover:shadow-2xl hover:scale-[1.03] ${table.status === "OCCUPIED" ? "border-rose-100 bg-rose-50/20" : "border-slate-100"
              }`}
            onClick={() => setSelectedTable(table)}
          >
            <div className={`absolute top-0 left-0 w-full h-1.5 ${getStatusColor(table.status)}`} />

            {/* Ready Order Notification Dot */}
            {readyTables.has(table.tableNumber) && (
              <div className="absolute top-4 right-4 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 border-2 border-white"></span>
              </div>
            )}

            <CardHeader className="p-6 pb-2 text-center">
              <div className="flex justify-center mb-2">
                <CardTitle className="text-4xl font-black text-slate-800">#{table.tableNumber}</CardTitle>
              </div>
              <Badge className={`mx-auto font-bold shadow-sm ${getStatusColor(table.status)}`}>
                {table.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-6 pt-2">
              <div className="mb-6 text-center text-sm font-bold text-slate-400">
                CAPACITY: {table.capacity} GUESTS
              </div>

              <div className="space-y-2">
                {isServer && table.status === "FREE" && (
                  <Button
                    className="w-full font-bold hover:bg-slate-800 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      startSessionMutation.mutate(table.tableId)
                    }}
                    disabled={startSessionMutation.isPending}
                  >
                    Open Table
                  </Button>
                )}

                {isCashier && table.status === "OCCUPIED" && (
                  <Button
                    className="w-full bg-emerald-600 font-bold hover:bg-emerald-700 shadow-lg"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedTable(table)
                    }}
                  >
                    View Bill
                  </Button>
                )}

                {isServer && (
                  <div className="flex gap-1">
                    {table.status === "FREE" && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 text-[10px] font-bold border-2"
                        onClick={(e) => {
                          e.stopPropagation()
                          statusMutation.mutate({ tableId: table.tableId, status: "RESERVED" })
                        }}
                      >
                        RESERVE
                      </Button>
                    )}
                    {(table.status === "RESERVED" || table.status === "OUT_OF_ORDER") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full text-[10px] font-bold text-white-400 hover:text-white-900"
                        onClick={(e) => {
                          e.stopPropagation()
                          statusMutation.mutate({ tableId: table.tableId, status: "FREE" })
                        }}
                      >
                        MAKE AVAILABLE
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TableDetailSheet
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        defaultTab={isCashier && !isServer ? "bill" : "orders"}
      />
    </div>
  )
}
