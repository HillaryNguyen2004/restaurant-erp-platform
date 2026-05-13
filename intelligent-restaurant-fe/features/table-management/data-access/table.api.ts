import { Order } from "@/features/order/config/order.config"
import { CONFIG } from "@/lib/config"
import { Table, TableStatus } from "../config/table.config"

export interface ITableApi {
  getAll(): Promise<Table[]>
  getTable(tableId: string): Promise<Table>
  updateStatus(tableId: string, status: TableStatus): Promise<void>
  startSession(tableId: string): Promise<any>
  getOrders(tableId: string): Promise<Order[]>
  placeOrder(tableId: string, items: any[]): Promise<Order>
  checkout(tableId: string): Promise<void>
}

const TABLE_URL = `${CONFIG.API_URL}/table-reservation`
const ORDER_URL = `${CONFIG.API_URL}/order-menu`

class RealTableApi implements ITableApi {
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

  async startSession(tableId: string): Promise<any> {
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
    const orderRes = await fetch(`${ORDER_URL}/order-sessions/table/${tableId}/open`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    })
    if (!orderRes.ok) throw new Error("Failed to open order session")

    // 3. Mark Table as Occupied
    await this.updateStatus(tableId, "OCCUPIED")

    return orderRes.json()
  }

  async getOrders(tableId: string): Promise<Order[]> {
    console.log("Table Id: ", tableId)
    const sessionRes = await fetch(`${ORDER_URL}/order-sessions/table/${tableId}`)
    if (!sessionRes.ok) return []
    const session = await sessionRes.json()
    const detailRes = await fetch(`${ORDER_URL}/order-sessions/${session.sessionId}`)
    if (!detailRes.ok) return []
    const details = await detailRes.json()
    return details.orders || []
  }

  async placeOrder(tableId: string, items: any[]): Promise<Order> {
    const sessionRes = await fetch(`${ORDER_URL}/order-sessions/table/${tableId}`)
    if (!sessionRes.ok) throw new Error("No active session for table")
    const session = await sessionRes.json()

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
    const sessionRes = await fetch(`${ORDER_URL}/order-sessions/table/${tableId}`)
    if (!sessionRes.ok) throw new Error("No active session for table")
    const session = await sessionRes.json()

    // 1. Close Order Session
    await fetch(`${ORDER_URL}/order-sessions/${session.sessionId}/close`, {
      method: "PUT",
    })

    // 2. Mark Table as Free
    await this.updateStatus(tableId, "FREE")
  }
}

export const tableApi: ITableApi = new RealTableApi()
