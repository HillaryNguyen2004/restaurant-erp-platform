import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { orderApi } from './order.api';
import { Order } from '../config/order.config';

export const orderQueries = {
  useOrders: () => useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getOrders(),
  }),

  usePlaceOrder: () => {
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => 
        orderApi.placeOrder(order),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['orders'] });
      },
    });
  },
};
