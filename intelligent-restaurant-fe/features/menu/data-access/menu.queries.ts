import { useQuery } from '@tanstack/react-query';
import { menuApi } from './menu.api';

export const menuQueries = {
  useCategories: () => useQuery({
    queryKey: ['categories'],
    queryFn: menuApi.getCategories,
  }),
  useItems: (categoryId?: string) => useQuery({
    queryKey: ['menu-items', categoryId],
    queryFn: () => menuApi.getItems(categoryId),
  }),
};
