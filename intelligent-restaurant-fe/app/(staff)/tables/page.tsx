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
import { LogOut } from "lucide-react"
import { toast } from "sonner"
import { useState } from "react"
import { TableDetailSheet } from "@/features/table-management/components/table-detail-sheet"

export default function TablesPage() {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()
  const { logout } = useAuth()

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
    <div className="p-4">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold">Table Management</h1>
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
          {tables?.filter((t) => t.status === "AVAILABLE").length} Free Tables
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
        {tables?.map((table) => (
          <Card
            key={table.id}
            className="overflow-hidden text-center"
            onClick={() => setSelectedTable(table)}
          >
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-2xl">#{table.tableNumber}</CardTitle>
              <Badge className={`mx-auto ${getStatusColor(table.status)}`}>
                {table.status}
              </Badge>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="mb-4 text-sm text-muted-foreground">
                Cap: {table.capacity}
              </div>
              <div
                className="grid grid-cols-1 gap-2"
                onClick={(e) => e.stopPropagation()}
              >
                {table.status === "AVAILABLE" ? (
                  <>
                    <Button
                      size="sm"
                      onClick={() =>
                        mutation.mutate({ id: table.id, status: "OCCUPIED" })
                      }
                    >
                      Occupy
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        mutation.mutate({ id: table.id, status: "RESERVED" })
                      }
                    >
                      Reserve
                    </Button>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      mutation.mutate({ id: table.id, status: "AVAILABLE" })
                    }
                  >
                    Release
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <TableDetailSheet
        table={selectedTable}
        onClose={() => setSelectedTable(null)}
      />
    </div>
  )
}
