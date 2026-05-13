import { z } from "zod"

export const OrderStatusSchema = z.enum([
  "PLACED",
  "PREPARING",
  "READY",
  "SERVED",
  "CANCELLED",
  "PAID",
])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

export const OrderItemSchema = z.object({
  itemId: z.string(),
  menuItemId: z.string(),
  menuItemName: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number(),
  subtotal: z.number(),
  modifiers: z.array(z.string()).optional(),
  specialInstructions: z.string().optional(),
  status: OrderStatusSchema.optional(),
})
export type OrderItem = z.infer<typeof OrderItemSchema>

export const OrderSchema = z.object({
  orderId: z.string(),
  sessionId: z.string(),
  tableNumber: z.string().optional(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  subtotal: z.number(),
  placedAt: z.string(),
})
export type Order = z.infer<typeof OrderSchema>
