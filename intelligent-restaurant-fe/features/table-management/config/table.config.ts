import { z } from 'zod';

export const TableStatusSchema = z.enum([
  'FREE',
  'RESERVED',
  'OCCUPIED',
  'OUT_OF_ORDER',
]);
export type TableStatus = z.infer<typeof TableStatusSchema>;

export const TableSchema = z.object({
  tableId: z.string(),
  tableNumber: z.string(),
  capacity: z.number(),
  status: TableStatusSchema,
  zone: z.string(),
});
export type Table = z.infer<typeof TableSchema>;
