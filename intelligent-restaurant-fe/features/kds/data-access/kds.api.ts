import { CONFIG } from "@/lib/config"
import { KitchenStation, KitchenTicket, KitchenTicketStatus } from "../config/kds.config"

export interface IKdsApi {
  getStations(): Promise<KitchenStation[]>
  getTickets(stationId: string): Promise<KitchenTicket[]>
  updateStatus(
    ticketId: string,
    status: KitchenTicketStatus,
    changedByUserId: string
  ): Promise<KitchenTicket>
}

const API_URL = `${CONFIG.API_URL}/kitchen-operation`

class RealKdsApi implements IKdsApi {
  async getStations(): Promise<KitchenStation[]> {
    const response = await fetch(`${API_URL}/kitchen/stations`)
    if (!response.ok) throw new Error("Failed to fetch kitchen stations")
    return response.json()
  }

  async getTickets(stationId: string): Promise<KitchenTicket[]> {
    const response = await fetch(
      `${API_URL}/kitchen/stations/${encodeURIComponent(stationId)}/tickets`
    )
    if (!response.ok) throw new Error("Failed to fetch tickets")
    const data = await response.json()
    // The backend returns TicketListResponseDto which has a list of tickets
    return data.tickets || []
  }

  async updateStatus(
    ticketId: string,
    status: KitchenTicketStatus,
    changedByUserId: string
  ): Promise<KitchenTicket> {
    const response = await fetch(
      `${API_URL}/kitchen/tickets/${ticketId}/status`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          newStatus: status,
          changedByUserId,
        }),
      }
    )
    if (!response.ok) throw new Error("Failed to update ticket status")
    return response.json()
  }
}

export const kdsApi: IKdsApi = new RealKdsApi()
