import { CONFIG } from "@/lib/config"
import { KitchenTicket, KitchenTicketStatus } from "../config/kds.config"
import { Order } from "@/features/order/config/order.config"

export interface IKdsApi {
  getTickets(): Promise<KitchenTicket[]>
  updateTicketStatus(
    ticketId: string,
    status: KitchenTicketStatus
  ): Promise<KitchenTicket>
  createTicketFromOrder(order: Order): Promise<KitchenTicket>
}

class MockKdsApi implements IKdsApi {
  async getTickets(): Promise<KitchenTicket[]> {
    const saved = localStorage.getItem("mock_tickets")
    return saved ? JSON.parse(saved) : []
  }

  async updateTicketStatus(
    ticketId: string,
    status: KitchenTicketStatus
  ): Promise<KitchenTicket> {
    const saved = localStorage.getItem("mock_tickets")
    const tickets = saved ? JSON.parse(saved) : []
    const ticket = tickets.find((t: KitchenTicket) => t.ticketId === ticketId)
    if (ticket) {
      ticket.status = status

      // Sync with mock_orders for consistency in mock mode
      const savedOrders = localStorage.getItem("mock_orders")
      if (savedOrders) {
        const orders = JSON.parse(savedOrders)
        const order = orders.find((o: Order) => o.id === ticket.orderId)
        if (order) {
          if (status === "IN_PROGRESS") order.status = "PREPARING"
          else if (status === "READY") order.status = "READY"
          else if (status === "COMPLETED") order.status = "SERVED"
          else if (status === "CANCELLED") order.status = "CANCELLED"
          localStorage.setItem("mock_orders", JSON.stringify(orders))
        }
      }
    }
    localStorage.setItem("mock_tickets", JSON.stringify(tickets))
    return ticket
  }

  async createTicketFromOrder(order: Order): Promise<KitchenTicket> {
    const newTicket: KitchenTicket = {
      ticketId: `tk-${Math.random().toString(36).substr(2, 9)}`,
      orderId: order.id,
      tableNumber: order.tableNumber,
      status: "PENDING",
      items: order.items.map(item => ({
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      })),
      priority: 1,
      elapsedMinutes: 15,
      remainingMinutes: 0,
      createdAt: new Date().toISOString(),
    }
    const saved = localStorage.getItem("mock_tickets")
    const tickets = saved ? JSON.parse(saved) : []
    tickets.push(newTicket)
    localStorage.setItem("mock_tickets", JSON.stringify(tickets))
    return newTicket
  }
}

class RealKdsApi implements IKdsApi {
  async getTickets(): Promise<KitchenTicket[]> {
    const response = await fetch(
      `${CONFIG.API_URL}/kitchen-operation/kitchen/stations/${CONFIG.KITCHEN_STATION_ID}/tickets`
    )
    if (!response.ok) throw new Error("Failed to load kitchen tickets")
    const data = await response.json()
    return data.tickets.map(mapTicket)
  }

  async updateTicketStatus(
    ticketId: string,
    status: KitchenTicketStatus
  ): Promise<KitchenTicket> {
    const response = await fetch(
      `${CONFIG.API_URL}/kitchen-operation/kitchen/tickets/${ticketId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          newStatus: status,
          changedByUserId: "frontend",
        }),
      }
    )
    if (!response.ok) throw new Error("Failed to update kitchen ticket")
    return mapTicket(await response.json())
  }

  async createTicketFromOrder(order: Order): Promise<KitchenTicket> {
    return {
      ticketId: `pending-${order.id}`,
      orderId: order.id,
      tableNumber: order.tableNumber,
      status: "PENDING",
      items: order.items.map(item => ({
        menuItemName: item.menuItemName,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      })),
      priority: order.items.length >= 8 ? 3 : order.items.length >= 5 ? 2 : 1,
      elapsedMinutes: 0,
      remainingMinutes: Math.max(10, order.items.length * 3),
      createdAt: new Date().toISOString(),
    }
  }
}

export const kdsApi: IKdsApi = CONFIG.IS_MOCK
  ? new MockKdsApi()
  : new RealKdsApi()

type BackendTicket = {
  ticketId: string
  orderId: string
  tableNumber?: string | null
  stationId?: string | null
  stationName?: string | null
  status: KitchenTicketStatus
  items?: BackendTicketItem[]
  courseType?: string | null
  priority: number
  elapsedMinutes?: number
  remainingMinutes?: number
  alertLevel?: string | null
  colorCode?: string | null
  hasAllergyAlert?: boolean | null
  specialInstructions?: string | null
  createdAt: string
}

type BackendTicketItem = {
  menuItemName: string
  quantity: number
  specialInstructions?: string | null
  allergyTags?: string[] | null
}

function mapTicket(ticket: BackendTicket): KitchenTicket {
  return {
    ticketId: ticket.ticketId,
    orderId: ticket.orderId,
    tableNumber: ticket.tableNumber ?? "Unknown",
    stationId: ticket.stationId ?? undefined,
    stationName: ticket.stationName ?? undefined,
    status: ticket.status,
    items: (ticket.items ?? []).map((item) => ({
      menuItemName: item.menuItemName,
      quantity: item.quantity,
      specialInstructions: item.specialInstructions ?? undefined,
      allergyTags: item.allergyTags ?? undefined,
    })),
    courseType: ticket.courseType ?? undefined,
    priority: ticket.priority,
    elapsedMinutes: Number(ticket.elapsedMinutes ?? 0),
    remainingMinutes: Number(ticket.remainingMinutes ?? 0),
    alertLevel: ticket.alertLevel ?? undefined,
    colorCode: ticket.colorCode ?? undefined,
    hasAllergyAlert: ticket.hasAllergyAlert ?? undefined,
    specialInstructions: ticket.specialInstructions ?? undefined,
    createdAt: ticket.createdAt,
  }
}
