import { z } from 'zod';

export const TableStatusSchema = z.enum([
  'AVAILABLE',
  'RESERVED',
  'OCCUPIED',
  'OUT_OF_ORDER',
]);
export type TableStatus = z.infer<typeof TableStatusSchema>;

export const TableSchema = z.object({
  id: z.string(),
  tableNumber: z.string(),
  capacity: z.number(),
  status: TableStatusSchema,
});
export type Table = z.infer<typeof TableSchema>;
