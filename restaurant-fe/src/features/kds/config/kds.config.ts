import { z } from "zod";

export const KitchenTicketSchema = z.object({
    id: z.string(),
    orderId: z.string(),
    items: z.array(z.object({
        id: z.string(),
        menuItemId: z.string(),
        name: z.string(),
        quantity: z.number(),
        note: z.string().optional(),
        status: z.enum(["PENDING", "PREPARING", "READY", "SERVED"]),
    })),
    status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]),
    createdAt: z.string(),
    station: z.string().optional(),
});

export type KitchenTicket = z.infer<typeof KitchenTicketSchema>;
