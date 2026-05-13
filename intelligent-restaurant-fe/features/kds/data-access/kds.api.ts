import { Order } from "@/features/order/config/order.config"
import { CONFIG } from "@/lib/config"
import { KitchenTicket, KitchenTicketStatus } from "../config/kds.config"

export interface IKdsApi {
  getTickets(stationId?: string): Promise<KitchenTicket[]>
  updateStatus(
    ticketId: string,
    status: KitchenTicketStatus
  ): Promise<KitchenTicket>
}

const API_URL = `${CONFIG.API_URL}/kitchen-operation`

class RealKdsApi implements IKdsApi {
  async getTickets(stationId: string = 'main'): Promise<KitchenTicket[]> {
    const response = await fetch(`${API_URL}/kitchen/stations/${stationId}/tickets`)
    if (!response.ok) throw new Error("Failed to fetch tickets")
    const data = await response.json()
    // The backend returns TicketListResponseDto which has a list of tickets
    return data.tickets || []
  }

  async updateStatus(
    ticketId: string,
    status: KitchenTicketStatus
  ): Promise<KitchenTicket> {
    const response = await fetch(
      `${API_URL}/kitchen/tickets/${ticketId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newStatus: status,
          changedByUserId: "STAFF_ID" // This should ideally come from Auth context
        }),
      }
    )
    if (!response.ok) throw new Error("Failed to update ticket status")
    return response.json()
  }
}

export const kdsApi: IKdsApi = new RealKdsApi()
