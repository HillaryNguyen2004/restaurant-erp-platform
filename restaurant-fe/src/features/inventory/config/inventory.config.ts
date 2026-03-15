import { z } from "zod";

export const IngredientSchema = z.object({
    id: z.string().uuid(),
    name: z.string(),
    unit: z.string(),
    currentStock: z.number(),
    minThreshold: z.number(),
    costPerUnit: z.number(),
});

export const StockLogSchema = z.object({
    ingredientId: z.string(),
    type: z.enum(["usage", "adjustment", "spoilage", "restock"]),
    quantity: z.number(),
    reason: z.string().optional(),
    loggedBy: z.string(),
    timestamp: z.date().default(new Date()),
});

export type Ingredient = z.infer<typeof IngredientSchema>;
export type StockLog = z.infer<typeof StockLogSchema>;
