import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { inventoryApi } from "./inventory.api";

export const useIngredients = () => {
    return useQuery({
        queryKey: ["ingredients"],
        queryFn: inventoryApi.getIngredients,
    });
};

export const useLogWaste = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: inventoryApi.logWaste,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["ingredients"] });
        },
    });
};
