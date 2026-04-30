import { z } from 'zod';
import { OrderItemSchema } from '@/features/order/config/order.config';

export const KitchenTicketStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'READY',
  'COMPLETED',
  'CANCELLED',
]);
export type KitchenTicketStatus = z.infer<typeof KitchenTicketStatusSchema>;

export const KitchenTicketSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  tableNumber: z.string(),
  status: KitchenTicketStatusSchema,
  items: z.array(OrderItemSchema),
  priority: z.number(),
  prepTimeMinutes: z.number(),
  createdAt: z.string(),
});
export type KitchenTicket = z.infer<typeof KitchenTicketSchema>;
