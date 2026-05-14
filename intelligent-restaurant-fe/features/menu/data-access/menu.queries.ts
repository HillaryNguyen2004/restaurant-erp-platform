import { useQuery } from "@tanstack/react-query"
import { menuApi } from "./menu.api"

export const menuKeys = {
  all: ['menu'] as const,
  full: () => [...menuKeys.all, 'full'] as const,
  item: (id: string) => [...menuKeys.all, 'item', id] as const,
  category: (id: string) => [...menuKeys.all, 'category', id] as const,
}

export const useMenu = () => {
  return useQuery({
    queryKey: menuKeys.full(),
    queryFn: () => menuApi.getMenu(),
  })
}

export const useGetAllMenuItems = () => {
  const { data } = useMenu()
  return { data: data?.items || [], isLoading: !data }
}

export const useCategories = () => {
  const { data } = useMenu()
  return { data: data?.categories || [], isLoading: !data }
}

export const useGetMenuItemById = (itemId: string) => {
  return useQuery({
    queryKey: menuKeys.item(itemId),
    queryFn: () => menuApi.getMenuItem(itemId),
    enabled: !!itemId,
  })
}

export const useGetMenuItemsByCategory = (categoryId: string) => {
  return useQuery({
    queryKey: menuKeys.category(categoryId),
    queryFn: () => menuApi.getMenuItemsByCategory(categoryId),
    enabled: !!categoryId,
  })
}
