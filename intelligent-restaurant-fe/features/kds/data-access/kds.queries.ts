import { useRealtime } from "@/providers/realtime-provider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { KitchenTicketStatus } from "../config/kds.config"
import { kdsApi } from "../data-access/kds.api"

export const kdsKeys = {
  all: ['tickets'] as const,
  list: (stationId: string) => [...kdsKeys.all, 'list', stationId] as const,
}

export const useTickets = (stationId: string = 'main') => {
  return useQuery({
    queryKey: kdsKeys.list(stationId),
    queryFn: () => kdsApi.getTickets(stationId),
    refetchInterval: 10000,
  })
}

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: KitchenTicketStatus }) =>
      kdsApi.updateStatus(ticketId, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kdsKeys.all })
      emit("ORDER_STATUS_UPDATED", {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        status: data.status,
      })
      toast.success(`Ticket updated to ${data.status}`)
    },
  })
}
