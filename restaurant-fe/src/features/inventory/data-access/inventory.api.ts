import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";
import { Ingredient, WasteLogInput } from "../config/inventory.config";

const MOCK_INGREDIENTS = [
    { id: "ing1", name: "Thịt bò", unit: "kg", quantity: 15, minThreshold: 5 },
    { id: "ing2", name: "Bún tươi", unit: "kg", quantity: 20, minThreshold: 10 },
    { id: "ing3", name: "Hành lá", unit: "g", quantity: 500, minThreshold: 200 },
    { id: "ing4", name: "Nước mắm", unit: "l", quantity: 5, minThreshold: 2 },
    { id: "ing5", name: "Rau sống", unit: "kg", quantity: 2, minThreshold: 5 },
];

const mockInventoryApi = {
    getIngredients: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_INGREDIENTS;
    },
    updateIngredient: async (id: string, data: Partial<Ingredient>) => {
        console.log("Mock Update Ingredient:", id, data);
        await new Promise(resolve => setTimeout(resolve, 500));
        return { success: true };
    },
    logWaste: async (data: WasteLogInput) => {
        console.log("Mock Log Waste:", data);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
    },
};

const realInventoryApi = {
    getIngredients: async () => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/inventory/ingredients`);
    },
    updateIngredient: async (id: string, data: Partial<Ingredient>) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/inventory/ingredients/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    logWaste: async (data: WasteLogInput) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/inventory/waste-logs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
};

export const inventoryApi = API_CONFIG.USE_MOCK ? mockInventoryApi : realInventoryApi;
