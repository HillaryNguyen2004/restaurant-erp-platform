import { z } from 'zod';

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
