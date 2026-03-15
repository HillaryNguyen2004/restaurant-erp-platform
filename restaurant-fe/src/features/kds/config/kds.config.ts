import { z } from "zod";

export const KDSTicketSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string(),
    station: z.enum(["grill", "fryer", "bar", "salad", "dessert"]),
    items: z.array(z.object({
        name: z.string(),
        quantity: z.number(),
        specialInstructions: z.string().optional(),
        status: z.enum(["pending", "started", "cooking", "ready"]),
    })),
    priority: z.number().default(0),
    receivedAt: z.date(),
    estimatedTime: z.number(), // in minutes
});

export type KDSTicket = z.infer<typeof KDSTicketSchema>;
