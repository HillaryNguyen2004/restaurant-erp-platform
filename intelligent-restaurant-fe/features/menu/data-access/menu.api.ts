import { CONFIG } from '@/lib/config';
import { MenuCategory, MenuItem } from '../config/menu.config';

export interface IMenuApi {
  getCategories(): Promise<MenuCategory[]>;
  getItems(categoryId?: string): Promise<MenuItem[]>;
}

class MockMenuApi implements IMenuApi {
  async getCategories(): Promise<MenuCategory[]> {
    return [
      { id: 'cat1', name: 'Food', description: 'Delicious dishes' },
      { id: 'cat2', name: 'Drinks', description: 'Refreshing beverages' },
    ];
  }

  async getItems(categoryId?: string): Promise<MenuItem[]> {
    const items: MenuItem[] = [
      {
        id: 'item1',
        categoryId: 'cat1',
        name: 'Pho Bo',
        description: 'Traditional Vietnamese beef noodle soup',
        price: 10,
        isAvailable: true,
        dishType: 'Noodle',
        courseType: 'MAIN',
        prepTimeMinutes: 5,
        allergyTags: ['beef'],
      },
      {
        id: 'item2',
        categoryId: 'cat1',
        name: 'Spring Rolls',
        description: 'Crispy fried spring rolls',
        price: 5,
        isAvailable: true,
        dishType: 'Appetizer',
        courseType: 'STARTER',
        prepTimeMinutes: 10,
        allergyTags: ['pork', 'shrimp'],
      },
      {
        id: 'item3',
        categoryId: 'cat2',
        name: 'Iced Coffee',
        description: 'Vietnamese coffee with condensed milk',
        price: 3,
        isAvailable: true,
        dishType: 'Drink',
        courseType: 'BEVERAGE',
        prepTimeMinutes: 3,
        allergyTags: ['caffeine', 'dairy'],
      },
    ];
    return categoryId ? items.filter(i => i.categoryId === categoryId) : items;
  }
}

class RealMenuApi implements IMenuApi {
  async getCategories(): Promise<MenuCategory[]> {
    const response = await fetch(`${CONFIG.API_URL}/menu/categories`);
    return response.json();
  }

  async getItems(categoryId?: string): Promise<MenuItem[]> {
    const url = categoryId 
      ? `${CONFIG.API_URL}/menu/items?categoryId=${categoryId}`
      : `${CONFIG.API_URL}/menu/items`;
    const response = await fetch(url);
    return response.json();
  }
}

export const menuApi: IMenuApi = CONFIG.IS_MOCK ? new MockMenuApi() : new RealMenuApi();
