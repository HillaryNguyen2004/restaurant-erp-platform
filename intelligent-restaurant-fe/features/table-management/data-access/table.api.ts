import { CONFIG } from "@/lib/config"
import { Table, TableStatus } from "../config/table.config"
import { Order } from "@/features/order/config/order.config"
export interface ITableApi {
  getTables(): Promise<Table[]>
  updateTableStatus(tableId: string, status: TableStatus): Promise<Table>
  getOrdersByTable(tableNumber: string): Promise<Order[]>
  placeOrderForTable(tableNumber: string, items: Order["items"]): Promise<Order>
  checkoutTable(tableNumber: string): Promise<void>
}

class MockTableApi implements ITableApi {
  async getTables(): Promise<Table[]> {
    const initialTables: Table[] = [
      { id: "t1", tableNumber: "1", capacity: 4, status: "AVAILABLE" },
      { id: "t2", tableNumber: "2", capacity: 2, status: "OCCUPIED" },
      { id: "t3", tableNumber: "3", capacity: 6, status: "RESERVED" },
      { id: "t4", tableNumber: "4", capacity: 4, status: "AVAILABLE" },
      { id: "t5", tableNumber: "5", capacity: 4, status: "AVAILABLE" },
      { id: "t6", tableNumber: "6", capacity: 2, status: "AVAILABLE" },
      { id: "t7", tableNumber: "7", capacity: 4, status: "OCCUPIED" },
      { id: "t8", tableNumber: "8", capacity: 8, status: "AVAILABLE" },
      { id: "t9", tableNumber: "9", capacity: 4, status: "RESERVED" },
      { id: "t10", tableNumber: "10", capacity: 6, status: "AVAILABLE" },
      { id: "t11", tableNumber: "11", capacity: 2, status: "AVAILABLE" },
      { id: "t12", tableNumber: "12", capacity: 4, status: "OCCUPIED" },
      { id: "t13", tableNumber: "13", capacity: 6, status: "AVAILABLE" },
      { id: "t14", tableNumber: "14", capacity: 4, status: "RESERVED" },
      { id: "t15", tableNumber: "15", capacity: 6, status: "AVAILABLE" },
      { id: "t16", tableNumber: "16", capacity: 8, status: "OUT_OF_ORDER" },
      { id: "t17", tableNumber: "17", capacity: 4, status: "AVAILABLE" },
      { id: "t18", tableNumber: "18", capacity: 2, status: "AVAILABLE" },
      { id: "t19", tableNumber: "19", capacity: 4, status: "OCCUPIED" },
      { id: "t20", tableNumber: "20", capacity: 6, status: "AVAILABLE" },
    ]

    const saved = localStorage.getItem("mock_tables")
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed) && parsed.length >= initialTables.length)
          return parsed
        // otherwise fall through and overwrite saved with the full initial set
      } catch (e) {
        // ignore parse errors and overwrite saved value
      }
    }

    localStorage.setItem("mock_tables", JSON.stringify(initialTables))

    return initialTables
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus
  ): Promise<Table> {
    const saved = localStorage.getItem("mock_tables")
    const tables = saved ? JSON.parse(saved) : []
    const table = tables.find((t: Table) => t.id === tableId)
    if (table) table.status = status
    localStorage.setItem("mock_tables", JSON.stringify(tables))
    return table
  }

  async getOrdersByTable(tableNumber: string): Promise<Order[]> {
    if (typeof window === "undefined") return []
    const saved = localStorage.getItem("mock_orders")
    const orders: Order[] = saved ? JSON.parse(saved) : []
    return orders.filter(
      (o) =>
        o.tableNumber === tableNumber &&
        o.status !== "SERVED" &&
        o.status !== "CANCELLED"
    )
  }

  async placeOrderForTable(
    tableNumber: string,
    items: Order["items"]
  ): Promise<Order> {
    if (typeof window === "undefined")
      throw new Error("Cannot place order on server")
    const newOrder: Order = {
      id: `ord-${Math.random().toString(36).substr(2, 9)}`,
      tableNumber,
      status: "PLACED",
      items,
      total: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
      createdAt: new Date().toISOString(),
    }
    const saved = localStorage.getItem("mock_orders")
    const orders = saved ? JSON.parse(saved) : []
    orders.push(newOrder)
    localStorage.setItem("mock_orders", JSON.stringify(orders))
    return newOrder
  }
  async checkoutTable(tableNumber: string): Promise<void> {
    const saved = localStorage.getItem("mock_orders")
    const orders: Order[] = saved ? JSON.parse(saved) : []
    const updated = orders.map((o) =>
      o.tableNumber === tableNumber &&
      o.status !== "CANCELLED" &&
      o.status !== "PAID"
        ? { ...o, status: "PAID" as const }
        : o
    )
    localStorage.setItem("mock_orders", JSON.stringify(updated))
  }
}

class RealTableApi implements ITableApi {
  async getTables(): Promise<Table[]> {
    const response = await fetch(`${CONFIG.API_URL}/tables`)
    return response.json()
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus
  ): Promise<Table> {
    const response = await fetch(`${CONFIG.API_URL}/tables/${tableId}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    })
    return response.json()
  }

  async getOrdersByTable(tableNumber: string): Promise<Order[]> {
    const res = await fetch(`${CONFIG.API_URL}/tables/${tableNumber}/orders`)
    return res.json()
  }

  async placeOrderForTable(
    tableNumber: string,
    items: Order["items"]
  ): Promise<Order> {
    const res = await fetch(`${CONFIG.API_URL}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tableNumber, items }),
    })
    return res.json()
  }

  async checkoutTable(tableNumber: string): Promise<void> {
    const saved = localStorage.getItem("mock_orders")
    const orders: Order[] = saved ? JSON.parse(saved) : []
    const updated = orders.map((o) =>
      o.tableNumber === tableNumber &&
      o.status !== "CANCELLED" &&
      o.status !== "PAID"
        ? { ...o, status: "PAID" as const }
        : o
    )
    localStorage.setItem("mock_orders", JSON.stringify(updated))
  }
}

export const tableApi: ITableApi = CONFIG.IS_MOCK
  ? new MockTableApi()
  : new RealTableApi()
