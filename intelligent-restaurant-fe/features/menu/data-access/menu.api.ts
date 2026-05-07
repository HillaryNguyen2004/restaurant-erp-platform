import { CONFIG } from "@/lib/config"
import { MenuCategory, MenuItem } from "../config/menu.config"

export interface IMenuApi {
  getCategories(): Promise<MenuCategory[]>
  getItems(categoryId?: string): Promise<MenuItem[]>
}

class MockMenuApi implements IMenuApi {
  async getCategories(): Promise<MenuCategory[]> {
    return [
      { id: "cat1", name: "Food", description: "Delicious dishes" },
      { id: "cat2", name: "Drinks", description: "Refreshing beverages" },
    ]
  }

  async getItems(categoryId?: string): Promise<MenuItem[]> {
    const items: MenuItem[] = [
      {
        id: "item1",
        categoryId: "cat1",
        name: "Pho Bo",
        description: "Traditional Vietnamese beef noodle soup",
        price: 10,
        isAvailable: true,
        dishType: "Noodle",
        courseType: "MAIN",
        prepTimeMinutes: 5,
        allergyTags: ["beef"],
        imageUrl:
          "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80",
      },
      {
        id: "item2",
        categoryId: "cat1",
        name: "Spring Rolls",
        description: "Crispy fried spring rolls",
        price: 5,
        isAvailable: true,
        dishType: "Appetizer",
        courseType: "STARTER",
        prepTimeMinutes: 10,
        allergyTags: ["pork", "shrimp"],
        imageUrl:
          "https://images.unsplash.com/photo-1695712641569-05eee7b37b6d?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item3",
        categoryId: "cat2",
        name: "Iced Coffee",
        description: "Vietnamese coffee with condensed milk",
        price: 3,
        isAvailable: true,
        dishType: "Drink",
        courseType: "BEVERAGE",
        prepTimeMinutes: 3,
        allergyTags: ["caffeine", "dairy"],
        imageUrl:
          "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=1637&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item4",
        categoryId: "cat1",
        name: "Banh Mi",
        description:
          "Vietnamese baguette with grilled pork, pickled vegetables & herbs",
        price: 4,
        isAvailable: true,
        dishType: "Sandwich",
        courseType: "MAIN",
        prepTimeMinutes: 7,
        allergyTags: ["gluten", "pork"],
        imageUrl:
          "https://images.unsplash.com/photo-1599719455360-ff0be7c4dd06?q=80&w=1449&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item5",
        categoryId: "cat1",
        name: "Com Tam",
        description:
          "Broken rice with grilled pork chop, egg & pickled vegetables",
        price: 8,
        isAvailable: true,
        dishType: "Rice",
        courseType: "MAIN",
        prepTimeMinutes: 10,
        allergyTags: ["pork", "egg"],
        imageUrl:
          "https://images.unsplash.com/photo-1597311280719-b6bb2ca37f62?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item6",
        categoryId: "cat1",
        name: "Bun Bo Hue",
        description: "Spicy beef & pork noodle soup from Hue",
        price: 9,
        isAvailable: true,
        dishType: "Noodle",
        courseType: "MAIN",
        prepTimeMinutes: 8,
        allergyTags: ["beef", "pork"],
        imageUrl:
          "https://images.unsplash.com/photo-1597345637412-9fd611e758f3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item9",
        categoryId: "cat2",
        name: "Fresh Coconut Water",
        description: "Served chilled straight from the coconut",
        price: 4,
        isAvailable: true,
        dishType: "Drink",
        courseType: "BEVERAGE",
        prepTimeMinutes: 2,
        allergyTags: [],
        imageUrl:
          "https://images.unsplash.com/photo-1567567278636-c8fa119561be?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      },
      {
        id: "item10",
        categoryId: "cat2",
        name: "Orange Juice",
        description: "Freshly pressed orange juice with a hint of lime",
        price: 3,
        isAvailable: true,
        dishType: "Drink",
        courseType: "BEVERAGE",
        prepTimeMinutes: 3,
        allergyTags: [],
        imageUrl:
          "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80",
      },
    ]
    return categoryId ? items.filter((i) => i.categoryId === categoryId) : items
  }
}

class RealMenuApi implements IMenuApi {
  async getCategories(): Promise<MenuCategory[]> {
    const response = await fetch(`${CONFIG.API_URL}/order-menu/menu`)
    if (!response.ok) throw new Error("Failed to load menu categories")
    const menu = await response.json()
    return menu.categories.map(mapCategory)
  }

  async getItems(categoryId?: string): Promise<MenuItem[]> {
    const url = categoryId
      ? `${CONFIG.API_URL}/order-menu/menu/categories/${categoryId}/items`
      : `${CONFIG.API_URL}/order-menu/menu`
    const response = await fetch(url)
    if (!response.ok) throw new Error("Failed to load menu items")
    const data = await response.json()
    const items = Array.isArray(data) ? data : data.items
    return items.map(mapItem)
  }
}

export const menuApi: IMenuApi = CONFIG.IS_MOCK
  ? new MockMenuApi()
  : new RealMenuApi()

type BackendMenuCategory = {
  categoryId: string
  name: string
  active: boolean
}

type BackendMenuItem = {
  itemId: string
  categoryId: string
  name: string
  description?: string | null
  price: number | string
  available: boolean
  dishType: string
  courseType: string
  prepTimeMinutes: number
  allergyTags?: string[]
}

function mapCategory(category: BackendMenuCategory): MenuCategory {
  return {
    id: category.categoryId,
    name: category.name,
    description: category.active ? undefined : "Inactive",
  }
}

function mapItem(item: BackendMenuItem): MenuItem {
  return {
    id: item.itemId,
    categoryId: item.categoryId,
    name: item.name,
    description: item.description ?? "",
    price: Number(item.price),
    isAvailable: Boolean(item.available),
    dishType: item.dishType,
    courseType: item.courseType,
    prepTimeMinutes: item.prepTimeMinutes,
    allergyTags: item.allergyTags ?? [],
  }
}
