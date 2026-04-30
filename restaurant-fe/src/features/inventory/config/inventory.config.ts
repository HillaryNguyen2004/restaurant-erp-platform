import { z } from "zod";

export const IngredientSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1),
    unit: z.string(),
    quantity: z.number(),
    minThreshold: z.number(),
});

export type Ingredient = z.infer<typeof IngredientSchema>;

export const WasteLogSchema = z.object({
    ingredientId: z.string(),
    quantity: z.number(),
    reason: z.string(),
    loggedBy: z.string(),
});

export type WasteLogInput = z.infer<typeof WasteLogSchema>;
