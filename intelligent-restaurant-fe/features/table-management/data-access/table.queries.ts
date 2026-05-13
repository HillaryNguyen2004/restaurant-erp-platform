import { useRealtime } from "@/providers/realtime-provider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { TableStatus } from "../config/table.config"
import { tableApi, TableOrderItemRequest } from "../data-access/table.api"

export const tableKeys = {
  all: ['tables'] as const,
  list: () => [...tableKeys.all, 'list'] as const,
  detail: (id: string) => [...tableKeys.all, 'detail', id] as const,
  orders: (id: string) => [...tableKeys.all, 'orders', id] as const,
}

export const useTables = () => {
  return useQuery({
    queryKey: tableKeys.list(),
    queryFn: () => tableApi.getAll(),
  })
}

export const useTableDetail = (tableId: string) => {
  return useQuery({
    queryKey: tableKeys.detail(tableId),
    queryFn: () => tableApi.getTable(tableId),
    enabled: !!tableId,
  })
}

export const useUpdateTableStatus = () => {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()

  return useMutation({
    mutationFn: ({ tableId, status }: { tableId: string; status: TableStatus }) =>
      tableApi.updateStatus(tableId, status),
    onSuccess: (_, { tableId, status }) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      emit("TABLE_STATUS_CHANGED", { tableId, status })
      toast.success(`Table updated to ${status}`)
    },
  })
}

export const useStartSession = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (tableId: string) => tableApi.startSession(tableId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      toast.success("Session started successfully")
    },
    onError: (error) => {
      toast.error("Failed to start session")
      console.error(error)
    },
  })
}

export const useTableOrders = (tableId: string | undefined) => {
  return useQuery({
    queryKey: tableKeys.orders(tableId!),
    queryFn: () => tableApi.getOrders(tableId!),
    enabled: !!tableId,
  })
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tableId, items }: { tableId: string; items: TableOrderItemRequest[] }) => 
      tableApi.placeOrder(tableId, items),
    onSuccess: (_, { tableId }) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.orders(tableId) })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
    },
  })
}

export const useCheckoutTable = () => {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()

  return useMutation({
    mutationFn: (tableId: string) => tableApi.checkout(tableId),
    onSuccess: (_, tableId) => {
      queryClient.invalidateQueries({ queryKey: tableKeys.all })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      emit("TABLE_STATUS_CHANGED", { tableId, status: "FREE" })
      toast.success("Table checked out!")
    },
  })
}
