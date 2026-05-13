import { CONFIG } from "@/lib/config";
import { MenuItem, MenuCategory } from "../config/menu.config";

export interface MenuResponse {
  categories: MenuCategory[];
  items: MenuItem[];
}

export interface IMenuApi {
  getMenu(): Promise<MenuResponse>;
  getMenuItem(itemId: string): Promise<MenuItem>;
  getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]>;
}

const API_URL = `${CONFIG.API_URL}/order-menu`

class RealMenuApi implements IMenuApi {
  async getMenu(): Promise<MenuResponse> {
    const response = await fetch(`${API_URL}/menu`)
    if (!response.ok) throw new Error("Failed to fetch menu")
    return response.json()
  }

  async getMenuItem(itemId: string): Promise<MenuItem> {
    const response = await fetch(`${API_URL}/menu/items/${itemId}`)
    if (!response.ok) throw new Error("Failed to fetch menu item")
    return response.json()
  }

  async getMenuItemsByCategory(categoryId: string): Promise<MenuItem[]> {
    const response = await fetch(`${API_URL}/menu/categories/${categoryId}/items`)
    if (!response.ok) throw new Error("Failed to fetch menu items by category")
    return response.json()
  }
}

export const menuApi: IMenuApi = new RealMenuApi()
