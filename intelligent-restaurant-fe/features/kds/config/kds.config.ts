import { z } from "zod"

export const KitchenTicketStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
])
export type KitchenTicketStatus = z.infer<typeof KitchenTicketStatusSchema>

export const KitchenTicketItemSchema = z.object({
  menuItemName: z.string(),
  quantity: z.number().min(1),
  specialInstructions: z.string().optional(),
  allergyTags: z.array(z.string()).optional(),
})
export type KitchenTicketItem = z.infer<typeof KitchenTicketItemSchema>

export const KitchenTicketSchema = z.object({
  ticketId: z.string(),
  orderId: z.string(),
  tableNumber: z.string(),
  stationId: z.string().optional(),
  stationName: z.string().optional(),
  status: KitchenTicketStatusSchema,
  items: z.array(KitchenTicketItemSchema),
  courseType: z.string().optional(),
  priority: z.number(),
  elapsedMinutes: z.number(),
  remainingMinutes: z.number(),
  alertLevel: z.string().optional(),
  colorCode: z.string().optional(),
  hasAllergyAlert: z.boolean().optional(),
  specialInstructions: z.string().optional(),
  createdAt: z.string(),
})
export type KitchenTicket = z.infer<typeof KitchenTicketSchema>

export function getWaitingMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

export function getUrgencyLevel(
  ticket: KitchenTicket
): "critical" | "warning" | "normal" {
  const waited = getWaitingMinutes(ticket.createdAt)
  if (waited >= ticket.elapsedMinutes || ticket.priority >= 3)
    return "critical"
  if (waited >= ticket.elapsedMinutes * 0.6 || ticket.priority === 2)
    return "warning"
  return "normal"
}

export function sortTicketsByPriority(
  tickets: KitchenTicket[]
): KitchenTicket[] {
  const urgencyOrder = { critical: 0, warning: 1, normal: 2 }
  return [...tickets].sort((a, b) => {
    const ua = urgencyOrder[getUrgencyLevel(a)]
    const ub = urgencyOrder[getUrgencyLevel(b)]
    if (ua !== ub) return ua - ub
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  })
}
