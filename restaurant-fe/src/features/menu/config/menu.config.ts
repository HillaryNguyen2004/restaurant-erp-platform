import { z } from "zod";

export const MenuItemSchema = z.object({
    id: z.string(),
    name: z.string().min(1, "Tên món không được để trống"),
    description: z.string().optional(),
    price: z.number().min(0, "Giá phải lớn hơn hoặc bằng 0"),
    categoryId: z.string(),
    imageUrl: z.string().url().optional().or(z.literal("")),
    isAvailable: z.boolean().default(true),
    ingredients: z.array(z.string()).optional(),
});

export type MenuItemInput = z.infer<typeof MenuItemSchema>;

export const CategorySchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Tên danh mục không được để trống"),
    description: z.string().optional(),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
