import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { KitchenTicketStatus } from "../config/kds.config"
import { kdsApi } from "./kds.api"

export const kdsQueries = {
  useTickets: () =>
    useQuery({
      queryKey: ["tickets"],
      queryFn: () => kdsApi.getTickets(),
      refetchInterval: 10000,
    }),

  useUpdateTicketStatus: () => {
    const queryClient = useQueryClient()

    return useMutation({
      mutationFn: ({
        id,
        status,
      }: {
        id: string
        status: KitchenTicketStatus
      }) => kdsApi.updateTicketStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["tickets"] })
      },
    })
  },
}
