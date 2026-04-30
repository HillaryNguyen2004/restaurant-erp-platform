import { z } from 'zod';

// Roles
export const RoleSchema = z.enum(['CUSTOMER', 'CHEF', 'CASHIER', 'ADMIN']);
export type Role = z.infer<typeof RoleSchema>;

// User
export const UserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string(),
  roles: z.array(RoleSchema),
});
export type User = z.infer<typeof UserSchema>;

// Menu
export const MenuCategorySchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
});
export type MenuCategory = z.infer<typeof MenuCategorySchema>;

export const MenuItemSchema = z.object({
  id: z.string(),
  categoryId: z.string(),
  name: z.string(),
  description: z.string(),
  price: z.number(),
  isAvailable: z.boolean(),
  dishType: z.string(),
  courseType: z.string(),
  prepTimeMinutes: z.number(),
  allergyTags: z.array(z.string()),
});
export type MenuItem = z.infer<typeof MenuItemSchema>;

// Order
export const OrderStatusSchema = z.enum([
  'PLACED',
  'PREPARING',
  'READY',
  'SERVED',
  'CANCELLED',
]);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderItemSchema = z.object({
  id: z.string(),
  menuItemId: z.string(),
  menuItemName: z.string(),
  quantity: z.number().min(1),
  price: z.number(),
  specialInstructions: z.string().optional(),
  status: OrderStatusSchema.optional(), // Some systems track item status
});
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string(),
  tableNumber: z.string(),
  status: OrderStatusSchema,
  items: z.array(OrderItemSchema),
  total: z.number(),
  createdAt: z.string(),
});
export type Order = z.infer<typeof OrderSchema>;

// Kitchen (KDS)
export const KitchenTicketStatusSchema = z.enum([
  'PENDING',
  'IN_PROGRESS',
  'READY',
  'COMPLETED',
  'CANCELLED',
]);
export type KitchenTicketStatus = z.infer<typeof KitchenTicketStatusSchema>;

export const KitchenTicketSchema = z.object({
  id: z.string(),
  orderId: z.string(),
  tableNumber: z.string(),
  status: KitchenTicketStatusSchema,
  items: z.array(OrderItemSchema),
  priority: z.number(),
  prepTimeMinutes: z.number(),
  createdAt: z.string(),
});
export type KitchenTicket = z.infer<typeof KitchenTicketSchema>;

// Table
export const TableStatusSchema = z.enum([
  'FREE',
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
  zone: z.string(),
});
export type Table = z.infer<typeof TableSchema>;
