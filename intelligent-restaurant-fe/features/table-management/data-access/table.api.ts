import { Order } from "@/features/order/config/order.config"
import { CONFIG } from "@/lib/config"
import { Table, TableStatus } from "../config/table.config"

export type TableOrderSession = {
  sessionId: string
}

export type TableOrderItemRequest = {
  menuItemId: string
  quantity: number
  specialInstructions?: string
}

export interface ITableApi {
  getAll(): Promise<Table[]>
  getTable(tableId: string): Promise<Table>
  updateStatus(tableId: string, status: TableStatus): Promise<void>
  startSession(tableId: string): Promise<TableOrderSession>
  getOrders(tableId: string): Promise<Order[]>
  placeOrder(tableId: string, items: TableOrderItemRequest[]): Promise<Order>
  checkout(tableId: string): Promise<void>
}

const TABLE_URL = `${CONFIG.API_URL}/table-reservation`
const ORDER_URL = `${CONFIG.API_URL}/order-menu`

class RealTableApi implements ITableApi {
  private async getActiveOrderSession(tableId: string): Promise<TableOrderSession | null> {
    const response = await fetch(`${ORDER_URL}/order-sessions/table/${tableId}`)
    if (response.ok) return response.json()
    if (response.status === 404) return null
    throw new Error("Failed to fetch active order session")
  }

  private async openOrderSession(tableId: string): Promise<TableOrderSession> {
    const response = await fetch(`${ORDER_URL}/order-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableId }),
    })
    if (!response.ok) throw new Error("Failed to open order session")
    return response.json()
  }

  private async ensureOrderSession(tableId: string): Promise<TableOrderSession> {
    const existingSession = await this.getActiveOrderSession(tableId)
    if (existingSession) return existingSession

    const openedSession = await this.openOrderSession(tableId)
    await this.updateStatus(tableId, "OCCUPIED")
    return openedSession
  }

  async getAll(): Promise<Table[]> {
    const response = await fetch(`${TABLE_URL}/tables`)
    if (!response.ok) throw new Error("Failed to fetch tables")
    return response.json()
  }

  async getTable(tableId: string): Promise<Table> {
    const response = await fetch(`${TABLE_URL}/tables/${tableId}`)
    if (!response.ok) throw new Error("Failed to fetch table")
    return response.json()
  }

  async updateStatus(tableId: string, status: TableStatus): Promise<void> {
    const statusMap: Record<TableStatus, string> = {
      FREE: "available",
      OCCUPIED: "occupied",
      RESERVED: "reserved",
      OUT_OF_ORDER: "out-of-order",
    }
    const endpoint = statusMap[status]
    const response = await fetch(`${TABLE_URL}/tables/${tableId}/${endpoint}`, {
      method: "PATCH",
    })
    if (!response.ok) throw new Error(`Failed to update table status to ${status}`)
  }

  async startSession(tableId: string): Promise<TableOrderSession> {
    // 1. Start Dining Session (Table Reservation Service)
    const diningRes = await fetch(`${TABLE_URL}/dining-sessions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tableId,
        expectedEndAt: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
      }),
    })
    if (!diningRes.ok) throw new Error("Failed to start dining session")

    // 2. Open Order Session (Order Menu Service)
    const orderSession = await this.openOrderSession(tableId)

    // 3. Mark Table as Occupied
    await this.updateStatus(tableId, "OCCUPIED")

    return orderSession
  }

  async getOrders(tableId: string): Promise<Order[]> {
    console.log("Table Id: ", tableId)
    const session = await this.getActiveOrderSession(tableId)
    if (!session) return []
    const detailRes = await fetch(`${ORDER_URL}/order-sessions/${session.sessionId}`)
    if (!detailRes.ok) return []
    const details = await detailRes.json()
    return details.orders || []
  }

  async placeOrder(tableId: string, items: TableOrderItemRequest[]): Promise<Order> {
    const session = await this.ensureOrderSession(tableId)

    const response = await fetch(
      `${ORDER_URL}/order-sessions/${session.sessionId}/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            menuItemId: i.menuItemId,
            quantity: i.quantity,
            specialInstructions: i.specialInstructions || "",
          })),
        }),
      }
    )
    if (!response.ok) throw new Error("Failed to place order")
    return response.json()
  }

  async checkout(tableId: string): Promise<void> {
    const session = await this.getActiveOrderSession(tableId)

    // 1. Close Order Session
    if (session) {
      const orderCloseResponse = await fetch(`${ORDER_URL}/order-sessions/${session.sessionId}/close`, {
        method: "PUT",
      })
      if (!orderCloseResponse.ok) throw new Error("Failed to close order session")
    }

    // 2. Mark the active dining session paid and finish it
    const diningCheckoutResponse = await fetch(
      `${TABLE_URL}/dining-sessions/table/${tableId}/checkout`,
      {
        method: "PATCH",
      }
    )
    if (!diningCheckoutResponse.ok) {
      throw new Error("Failed to finish dining session")
    }

    // 3. Mark Table as Free for compatibility with the table endpoint
    await this.updateStatus(tableId, "FREE")
  }
}

export const tableApi: ITableApi = new RealTableApi()
