import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { kdsApi } from "./kds.api";

export const useKitchenTickets = (station?: string) => {
    return useQuery({
        queryKey: ["kitchen-tickets", station],
        queryFn: () => kdsApi.getTickets(station),
        refetchInterval: 5000, // Poll every 5 seconds
    });
};

export const useUpdateTicketStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => kdsApi.updateTicketStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kitchen-tickets"] });
        },
    });
};

export const useUpdateItemStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ ticketId, itemId, status }: { ticketId: string; itemId: string; status: string }) => 
            kdsApi.updateItemStatus(ticketId, itemId, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["kitchen-tickets"] });
        },
    });
};
