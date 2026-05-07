"use client"

import { useRealtime } from "@/providers/realtime-provider"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/features/auth/components/auth-provider"
import {
  TableStatus,
  Table,
} from "@/features/table-management/config/table.config"
import { tableApi } from "@/features/table-management/data-access/table.api"
import { useQueries, useQuery } from "@tanstack/react-query"
import { LogOut, Receipt } from "lucide-react"
import { useState } from "react"
import { TableDetailSheet } from "@/features/table-management/components/table-detail-sheet"

export default function BillingPage() {
  const { logout } = useAuth()

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { data: tables, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: tableApi.getTables,
  })
  const orderQueries = useQueries({
    queries: (tables ?? []).map((table) => ({
      queryKey: ["table-orders", table.tableNumber],
      queryFn: () => tableApi.getOrdersByTable(table.tableNumber),
      enabled: !!tables,
    })),
  })

  if (isLoading) return <div className="p-8">Loading Billing...</div>

  const activeOrderCounts = new Map(
    (tables ?? []).map((table, index) => {
      const orders = orderQueries[index]?.data ?? []
      const count = orders.filter(
        (order) => order.status !== "PAID" && order.status !== "CANCELLED"
      ).length
      return [table.id, count]
    })
  )

  const getEffectiveStatus = (table: Table): TableStatus => {
    if ((activeOrderCounts.get(table.id) ?? 0) > 0) return "OCCUPIED"
    return table.status
  }

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "AVAILABLE":
        return "bg-green-500"
      case "OCCUPIED":
        return "bg-red-500"
      case "RESERVED":
        return "bg-blue-500"
      case "OUT_OF_ORDER":
        return "bg-gray-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="container mx-auto p-8">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Billing Management
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Logout"
            className="text-slate-400 hover:text-red-500"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-4 py-1.5 text-base font-semibold border-slate-200">
            <Receipt className="w-4 h-4 mr-2 text-emerald-600" />
            {tables?.filter((t) => getEffectiveStatus(t) === "OCCUPIED").length ?? 0} Active Tables
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables?.map((table) => {
          const status = getEffectiveStatus(table)
          return (
            <Card
              key={table.id}
              className={`overflow-hidden border-2 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02] ${
                status === "OCCUPIED" ? "border-emerald-500/20 bg-emerald-50/10" : "border-slate-100"
              }`}
              onClick={() => setSelectedTable({ ...table, status })}
            >
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-3xl font-black text-slate-800">#{table.tableNumber}</CardTitle>
                <Badge className={`mx-auto font-bold ${getStatusColor(status)}`}>
                  {status}
                </Badge>
              </CardHeader>
              <CardContent className="p-5 pt-2">
                <div className="text-sm font-medium text-slate-500">
                  Capacity: {table.capacity}
                </div>
                {status === "OCCUPIED" && (
                  <div className="mt-4">
                    <Button variant="default" className="w-full bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-200">
                      View Bill
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
      <TableDetailSheet
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        defaultTab="bill"
      />
    </div>
  )
}
