import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";
import { PaymentInput } from "../config/billing.config";

const mockBillingApi = {
    getInvoice: async (orderId: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return {
            id: "INV-" + orderId,
            orderId,
            items: [],
            subtotal: 0,
            tax: 0,
            serviceFee: 0,
            total: 0,
            status: "UNPAID"
        };
    },
    processPayment: async (data: PaymentInput) => {
        console.log("Mock Process Payment:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
};

const realBillingApi = {
    getInvoice: async (orderId: string) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/billing/invoices/${orderId}`);
    },
    processPayment: async (data: PaymentInput) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/billing/payments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
};

export const billingApi = API_CONFIG.USE_MOCK ? mockBillingApi : realBillingApi;
