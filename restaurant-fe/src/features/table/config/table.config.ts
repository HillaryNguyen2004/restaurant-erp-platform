import { z } from "zod";

export const TableSchema = z.object({
    id: z.string(),
    number: z.number(),
    capacity: z.number(),
    status: z.enum(["available", "occupied", "reserved", "cleaning"]),
    currentOrderId: z.string().optional(),
});

export type Table = z.infer<typeof TableSchema>;
