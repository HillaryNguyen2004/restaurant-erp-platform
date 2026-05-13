import { useRealtime } from "@/providers/realtime-provider"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { KitchenTicket, KitchenTicketStatus } from "../config/kds.config"
import { kdsApi } from "../data-access/kds.api"

export const kdsKeys = {
  all: ["tickets"] as const,
  stations: () => [...kdsKeys.all, "stations"] as const,
  tickets: () => [...kdsKeys.all, "lists"] as const,
  list: (stationId: string) => [...kdsKeys.tickets(), "list", stationId] as const,
}

export const useStations = () => {
  return useQuery({
    queryKey: kdsKeys.stations(),
    queryFn: () => kdsApi.getStations(),
    staleTime: 60000,
  })
}

export const useTickets = (stationId?: string) => {
  return useQuery({
    queryKey: kdsKeys.list(stationId ?? "none"),
    queryFn: () => kdsApi.getTickets(stationId!),
    enabled: Boolean(stationId),
    refetchInterval: 10000,
  })
}

export const useUpdateTicketStatus = () => {
  const queryClient = useQueryClient()
  const { emit } = useRealtime()

  return useMutation({
    mutationFn: ({
      ticketId,
      status,
      changedByUserId,
    }: {
      ticketId: string
      status: KitchenTicketStatus
      changedByUserId: string
    }) => kdsApi.updateStatus(ticketId, status, changedByUserId),
    onMutate: async ({ ticketId, status }) => {
      await queryClient.cancelQueries({ queryKey: kdsKeys.tickets() })
      const previousTickets = queryClient.getQueriesData<KitchenTicket[]>({
        queryKey: kdsKeys.tickets(),
      })

      queryClient.setQueriesData<KitchenTicket[]>(
        { queryKey: kdsKeys.tickets() },
        (current) =>
          current?.map((ticket) =>
            ticket.ticketId === ticketId ? { ...ticket, status } : ticket
          )
      )

      return { previousTickets }
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: kdsKeys.tickets() })
      emit("ORDER_STATUS_UPDATED", {
        orderId: data.orderId,
        tableNumber: data.tableNumber,
        status: data.status,
      })
      toast.success(`Ticket updated to ${data.status}`)
    },
    onError: (_error, _variables, context) => {
      context?.previousTickets.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
      toast.error("Failed to update ticket")
    },
  })
}
