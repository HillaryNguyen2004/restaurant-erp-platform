import { z } from 'zod';

export const OrderStatusSchema = z.enum([
  'PLACED',
  'PREPARING',
  'READY',
  'SERVED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  menuItemName: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
  specialInstructions: z.string().optional(),
  status: OrderStatusSchema.optional(),
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  tableNumber: z.string(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  total: z.number(),
  createdAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;
