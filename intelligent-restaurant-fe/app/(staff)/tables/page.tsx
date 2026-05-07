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
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { LogOut, UtensilsCrossed } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { TableDetailSheet } from "@/features/table-management/components/table-detail-sheet"

export default function TablesPage() {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()
  const { logout, user } = useAuth()
  const role = user?.roles?.[0]

  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const { data: tables, isLoading } = useQuery({
    queryKey: ["tables"],
    queryFn: tableApi.getTables,
  })

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TableStatus }) =>
      tableApi.updateTableStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      emit("TABLE_STATUS_CHANGED", data)
      toast.success(`Table ${data.tableNumber} updated to ${data.status}`)
    },
  })

  if (isLoading) return <div className="p-8">Loading Tables...</div>

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
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-4xl font-black tracking-tight text-slate-900">
            Table Management
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => logout()}
            title="Logout"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
        <Badge variant="outline" className="px-3 py-1 text-lg">
          {tables?.filter((t) => t.status === "AVAILABLE").length ?? 0} Free Tables
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables?.map((table) => (
          <Card
            key={table.id}
            className="overflow-hidden border-2 border-slate-100 transition-all cursor-pointer hover:shadow-xl hover:scale-[1.02]"
            onClick={() => setSelectedTable(table)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-2xl">#{table.tableNumber}</CardTitle>
              <Badge className={`mx-auto ${getStatusColor(table.status)}`}>
                {table.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-5 pt-2 text-center">
              <div className="mb-4 text-sm font-medium text-slate-500">
                Capacity: {table.capacity}
              </div>
                {(role === "TABLE_STAFF" || role === "ADMIN") && (
                  <>
                    {table.status === "AVAILABLE" ? (
                      <>
                        <Button
                          size="sm"
                          className="w-full bg-slate-900 text-white hover:bg-slate-800"
                          onClick={(event) => {
                            event.stopPropagation()
                            mutation.mutate({ id: table.id, status: "OCCUPIED" })
                          }}
                        >
                          Occupy
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full border-2"
                          onClick={(event) => {
                            event.stopPropagation()
                            mutation.mutate({ id: table.id, status: "RESERVED" })
                          }}
                        >
                          Reserve
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="w-full text-slate-500 hover:bg-slate-100"
                        onClick={(event) => {
                          event.stopPropagation()
                          mutation.mutate({ id: table.id, status: "AVAILABLE" })
                        }}
                      >
                        Release
                      </Button>
                    )}
                    {(table.status === "AVAILABLE" ||
                      table.status === "OCCUPIED") && (
                      <Button
                        size="sm"
                        variant="secondary"
                        className="mt-2 w-full gap-2"
                        onClick={(event) => {
                          event.stopPropagation()
                          setSelectedTable(table)
                        }}
                      >
                        <UtensilsCrossed className="h-4 w-4" />
                        Order
                      </Button>
                    )}
                  </>
                )}
            </CardContent>
          </Card>
        ))}
      </div>
      <TableDetailSheet
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
        defaultTab={role === "TABLE_STAFF" ? "pos" : undefined}
      />
    </div>
  )
}
