import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";
import { ReservationInput } from "../config/table.config";

const MOCK_TABLES = [
    { id: "1", number: 1, capacity: 4, status: "AVAILABLE" },
    { id: "2", number: 2, capacity: 2, status: "OCCUPIED" },
    { id: "3", number: 3, capacity: 4, status: "RESERVED" },
    { id: "4", number: 4, capacity: 6, status: "AVAILABLE" },
    { id: "5", number: 5, capacity: 4, status: "MAINTENANCE" },
    { id: "6", number: 6, capacity: 2, status: "AVAILABLE" },
    { id: "7", number: 7, capacity: 4, status: "OCCUPIED" },
    { id: "8", number: 8, capacity: 8, status: "AVAILABLE" },
];

const mockTableApi = {
    getTables: async () => {
        await new Promise(resolve => setTimeout(resolve, 700));
        return MOCK_TABLES;
    },
    updateTableStatus: async (id: string, status: string) => {
        console.log("Mock Update Table Status:", id, status);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    },
    getReservations: async () => {
        await new Promise(resolve => setTimeout(resolve, 600));
        return [];
    },
    createReservation: async (data: ReservationInput) => {
        console.log("Mock Create Reservation:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...data, id: Math.random().toString() };
    },
};

const realTableApi = {
    getTables: async () => {
        return fetchWithToken(`${API_CONFIG.TABLE_RESERVATION}/tables`);
    },
    updateTableStatus: async (id: string, status: string) => {
        return fetchWithToken(`${API_CONFIG.TABLE_RESERVATION}/tables/${id}/status`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status }),
        });
    },
    getReservations: async () => {
        return fetchWithToken(`${API_CONFIG.TABLE_RESERVATION}/reservations`);
    },
    createReservation: async (data: ReservationInput) => {
        return fetchWithToken(`${API_CONFIG.TABLE_RESERVATION}/reservations`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
};

export const tableApi = API_CONFIG.USE_MOCK ? mockTableApi : realTableApi;
