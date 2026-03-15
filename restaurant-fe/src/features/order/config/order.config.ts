import { z } from "zod";

export const OrderItemSchema = z.object({
    menuItemId: z.string(),
    quantity: z.number().min(1),
    specialInstructions: z.string().optional(),
    status: z.enum(["pending", "started", "cooking", "ready", "served"]),
});

export const OrderSchema = z.object({
    id: z.string().uuid().optional(),
    tableId: z.string(),
    items: z.array(OrderItemSchema),
    status: z.enum(["open", "confirmed", "completed", "cancelled"]),
    createdAt: z.date().optional(),
});

export type Order = z.infer<typeof OrderSchema>;
export type OrderItem = z.infer<typeof OrderItemSchema>;
