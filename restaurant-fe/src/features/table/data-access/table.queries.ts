import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { tableApi } from "./table.api";

export const useTables = () => {
    return useQuery({
        queryKey: ["tables"],
        queryFn: tableApi.getTables,
        refetchInterval: 10000,
    });
};

export const useUpdateTableStatus = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => tableApi.updateTableStatus(id, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["tables"] });
        },
    });
};

export const useCreateReservation = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: tableApi.createReservation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["reservations"] });
        },
    });
};
