import { z } from "zod"

export const KitchenTicketStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "READY",
  "COMPLETED",
  "CANCELLED",
])
export type KitchenTicketStatus = z.infer<typeof KitchenTicketStatusSchema>

export const KitchenTicketSchema = z.object({
  ticketId: z.string(),
  orderId: z.string(),
  tableNumber: z.string(),
  status: KitchenTicketStatusSchema,
  items: z.array(z.object({
    menuItemName: z.string(),
    quantity: z.number(),
    specialInstructions: z.string().optional(),
    allergyTags: z.array(z.string()).optional(),
  })),
  priority: z.number(),
  elapsedMinutes: z.number(),
  remainingMinutes: z.number(),
  alertLevel: z.string(),
  createdAt: z.string(),
})
export type KitchenTicket = z.infer<typeof KitchenTicketSchema>

export const KitchenStationSchema = z.object({
  stationId: z.string(),
  name: z.string(),
  stationType: z.string(),
  supportedDishTypes: z.array(z.string()),
  active: z.boolean(),
})
export type KitchenStation = z.infer<typeof KitchenStationSchema>

export function getWaitingMinutes(createdAt: string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 60000)
}

export function getUrgencyLevel(
  ticket: KitchenTicket
): "critical" | "warning" | "normal" {
  if (ticket.alertLevel === 'CRITICAL' || ticket.priority >= 3)
    return "critical"
  if (ticket.alertLevel === 'WARNING' || ticket.priority === 2)
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
