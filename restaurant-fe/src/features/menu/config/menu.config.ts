import { z } from "zod";

export const MenuItemSchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, "Tên món phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
    price: z.number().min(0, "Giá không được âm"),
    category: z.string(),
    image: z.string().url().optional(),
    isAvailable: z.boolean().default(true),
    allergens: z.array(z.string()).default([]),
});

export type MenuItem = z.infer<typeof MenuItemSchema>;

export const CategorySchema = z.object({
    id: z.string().uuid().optional(),
    name: z.string().min(2, "Tên danh mục phải có ít nhất 2 ký tự"),
    description: z.string().optional(),
});

export type Category = z.infer<typeof CategorySchema>;
