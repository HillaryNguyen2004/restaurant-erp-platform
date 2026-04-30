import { z } from "zod";

export const TableSchema = z.object({
    id: z.string(),
    number: z.number(),
    capacity: z.number(),
    status: z.enum(["AVAILABLE", "OCCUPIED", "RESERVED", "MAINTENANCE"]),
    position: z.object({
        x: z.number(),
        y: z.number(),
    }).optional(),
});

export type Table = z.infer<typeof TableSchema>;

export const ReservationSchema = z.object({
    id: z.string().optional(),
    tableId: z.string(),
    customerName: z.string().min(1),
    customerPhone: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    numberOfGuests: z.number().min(1),
});

export type ReservationInput = z.infer<typeof ReservationSchema>;
