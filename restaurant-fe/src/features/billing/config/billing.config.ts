import { z } from "zod";

export const InvoiceSchema = z.object({
    id: z.string().uuid(),
    orderId: z.string(),
    subtotal: z.number(),
    tax: z.number(),
    serviceFee: z.number(),
    discounts: z.number(),
    total: z.number(),
    status: z.enum(["unpaid", "partially_paid", "paid", "refunded"]),
});

export const PaymentSchema = z.object({
    invoiceId: z.string(),
    amount: z.number(),
    method: z.enum(["cash", "card", "qr", "transfer"]),
    staffId: z.string().optional(),
    tipAmount: z.number().default(0),
});

export type Invoice = z.infer<typeof InvoiceSchema>;
export type Payment = z.infer<typeof PaymentSchema>;
