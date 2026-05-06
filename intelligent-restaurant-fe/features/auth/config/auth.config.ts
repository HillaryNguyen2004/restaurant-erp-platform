import { z } from 'zod';

export const RoleSchema = z.enum(['TABLE', 'KITCHEN_STAFF', 'CASHIER', 'TABLE_STAFF', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(RoleSchema),
});
export type User = z.infer<typeof UserSchema>;
