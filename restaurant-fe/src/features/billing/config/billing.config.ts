import { z } from "zod";

export const InvoiceSchema = z.object({
    id: z.string(),
    orderId: z.string(),
    items: z.array(z.object({
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        total: z.number(),
    })),
    subtotal: z.number(),
    tax: z.number(),
    serviceFee: z.number(),
    total: z.number(),
    status: z.enum(["UNPAID", "PAID", "PARTIALLY_PAID", "CANCELLED"]),
});

export type Invoice = z.infer<typeof InvoiceSchema>;

export const PaymentSchema = z.object({
    invoiceId: z.string(),
    amount: z.number(),
    method: z.enum(["CASH", "CARD", "QR"]),
    tip: z.number().optional().default(0),
});

export type PaymentInput = z.infer<typeof PaymentSchema>;
