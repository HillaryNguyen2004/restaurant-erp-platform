import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";
import { MenuItemInput, CategoryInput } from "../config/menu.config";

const MOCK_CATEGORIES = [
    { id: "c1", name: "Món chính", description: "Các món ăn no" },
    { id: "c2", name: "Khai vị", description: "Các món nhẹ nhàng" },
    { id: "c3", name: "Tráng miệng", description: "Bánh ngọt và trái cây" },
    { id: "c4", name: "Đồ uống", description: "Nước giải khát và rượu" },
];

const MOCK_MENU_ITEMS = [
    { id: "1", name: "Phở Bò Hà Nội", description: "Phở bò truyền thống với nước dùng đậm đà", price: 65000, categoryId: "c1", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=500&auto=format&fit=crop&q=60" },
    { id: "2", name: "Bún Chả", description: "Thịt nướng than hồng ăn kèm bún và nước mắm", price: 55000, categoryId: "c1", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1541544741938-0af808871cc0?w=500&auto=format&fit=crop&q=60" },
    { id: "3", name: "Gỏi Cuốn", description: "Tôm, thịt và rau tươi cuốn bánh tráng", price: 35000, categoryId: "c2", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1534422298391-e4f8c170db06?w=500&auto=format&fit=crop&q=60" },
    { id: "4", name: "Cà Phê Sữa Đá", description: "Cà phê Robusta pha phin truyền thống", price: 25000, categoryId: "c4", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&auto=format&fit=crop&q=60" },
    { id: "5", name: "Chè Ba Màu", description: "Món tráng miệng truyền thống", price: 20000, categoryId: "c3", isAvailable: true, imageUrl: "https://images.unsplash.com/photo-1551024506-0bccd828d307?w=500&auto=format&fit=crop&q=60" },
];

const mockMenuApi = {
    getMenuItems: async () => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return MOCK_MENU_ITEMS;
    },
    getMenuItemById: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return MOCK_MENU_ITEMS.find(item => item.id === id);
    },
    createMenuItem: async (data: MenuItemInput) => {
        console.log("Mock Create Menu Item:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...data, id: Math.random().toString() };
    },
    updateMenuItem: async (id: string, data: MenuItemInput) => {
        console.log("Mock Update Menu Item:", id, data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...data, id };
    },
    deleteMenuItem: async (id: string) => {
        console.log("Mock Delete Menu Item:", id);
        await new Promise(resolve => setTimeout(resolve, 800));
        return { success: true };
    },
    getCategories: async () => {
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_CATEGORIES;
    },
    createCategory: async (data: CategoryInput) => {
        console.log("Mock Create Category:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { ...data, id: Math.random().toString() };
    },
};

const realMenuApi = {
    getMenuItems: async () => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/menu-items`);
    },
    getMenuItemById: async (id: string) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/menu-items/${id}`);
    },
    createMenuItem: async (data: MenuItemInput) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/menu-items`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    updateMenuItem: async (id: string, data: MenuItemInput) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/menu-items/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    deleteMenuItem: async (id: string) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/menu-items/${id}`, {
            method: "DELETE",
        });
    },
    getCategories: async () => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/categories`);
    },
    createCategory: async (data: CategoryInput) => {
        return fetchWithToken(`${API_CONFIG.ORDER_MENU}/categories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
};

export const menuApi = API_CONFIG.USE_MOCK ? mockMenuApi : realMenuApi;
