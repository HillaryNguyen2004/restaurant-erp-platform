import { useMutation, useQuery } from "@tanstack/react-query";
import { billingApi } from "./billing.api";

export const useInvoice = (orderId: string) => {
    return useQuery({
        queryKey: ["invoice", orderId],
        queryFn: () => billingApi.getInvoice(orderId),
        enabled: !!orderId,
    });
};

export const useProcessPayment = () => {
    return useMutation({
        mutationFn: billingApi.processPayment,
    });
};
