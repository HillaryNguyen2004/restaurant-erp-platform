import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";

const MOCK_TICKETS = [
    {
        id: "T-1001",
        orderId: "O-501",
        items: [
            { id: "i1", menuItemId: "1", name: "Phở Bò Hà Nội", quantity: 2, note: "Ít bánh, nhiều hành", status: "PENDING" },
            { id: "i2", menuItemId: "3", name: "Gỏi Cuốn", quantity: 1, status: "PREPARING" },
        ],
        status: "IN_PROGRESS",
        createdAt: new Date(Date.now() - 15 * 60000).toISOString(),
        station: "Noodle"
    },
    {
        id: "T-1002",
        orderId: "O-502",
        items: [
            { id: "i3", menuItemId: "2", name: "Bún Chả", quantity: 1, status: "READY" },
            { id: "i4", menuItemId: "4", name: "Cà Phê Sữa Đá", quantity: 1, status: "READY" },
        ],
        status: "PENDING",
        createdAt: new Date(Date.now() - 5 * 60000).toISOString(),
        station: "Grill"
    },
];

const mockKdsApi = {
    getTickets: async (station?: string) => {
        await new Promise(resolve => setTimeout(resolve, 600));
        if (station) {
            return MOCK_TICKETS.filter(t => t.station === station);
        }
        return MOCK_TICKETS;
    },
    updateTicketStatus: async (id: string, status: string) => {
        console.log("Mock Update Ticket Status:", id, status);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    },
    updateItemStatus: async (ticketId: string, itemId: string, status: string) => {
        console.log("Mock Update Item Status:", ticketId, itemId, status);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    },
};

const realKdsApi = {
    getTickets: async (station?: string) => {
        const url = station 
            ? `${API_CONFIG.KITCHEN_OPERATION}/tickets?station=${station}`
            : `${API_CONFIG.KITCHEN_OPERATION}/tickets`;
        return fetchWithToken(url);
    },
    updateTicketStatus: async (id: string, status: string) => {
        return fetchWithToken(`${API_CONFIG.KITCHEN_OPERATION}/tickets/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    },
    updateItemStatus: async (ticketId: string, itemId: string, status: string) => {
        return fetchWithToken(`${API_CONFIG.KITCHEN_OPERATION}/tickets/${ticketId}/items/${itemId}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    },
};

export const kdsApi = API_CONFIG.USE_MOCK ? mockKdsApi : realKdsApi;
