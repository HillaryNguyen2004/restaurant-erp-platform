import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { orderApi, PlaceOrderItemRequest } from "./order.api"
import { toast } from "sonner"

export const orderKeys = {
  all: ['orders'] as const,
  session: (sessionId: string) => [...orderKeys.all, 'session', sessionId] as const,
  tableSession: (tableId: string) => [...orderKeys.all, 'table-session', tableId] as const,
}

export const useOrdersBySession = (sessionId: string) => {
  return useQuery({
    queryKey: orderKeys.session(sessionId),
    queryFn: () => orderApi.getOrdersBySession(sessionId),
    enabled: !!sessionId,
  })
}

export const useSessionByTable = (tableId: string | undefined) => {
  return useQuery({
    queryKey: orderKeys.tableSession(tableId || ''),
    queryFn: () => orderApi.getSessionByTable(tableId!),
    enabled: !!tableId,
  })
}

export const usePlaceOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, items }: { sessionId: string; items: PlaceOrderItemRequest[] }) => 
      orderApi.placeOrder(sessionId, items),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.session(sessionId) })
      toast.success("Order placed successfully!")
    },
    onError: (error) => {
      toast.error("Failed to place order")
      console.error(error)
    },
  })
}

export const useCancelOrder = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ sessionId, orderId, reason }: { sessionId: string; orderId: string; reason: string }) =>
      orderApi.cancelOrder(sessionId, orderId, reason),
    onSuccess: (_, { sessionId }) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.session(sessionId) })
      toast.success("Order cancelled")
    },
  })
}
