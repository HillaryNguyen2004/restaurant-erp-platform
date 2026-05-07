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
          return withActiveOrderStatuses(parsed)
        // otherwise fall through and overwrite saved with the full initial set
      } catch (e) {
        // ignore parse errors and overwrite saved value
      }
    }

    localStorage.setItem("mock_tables", JSON.stringify(initialTables))

    return withActiveOrderStatuses(initialTables)
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
        o.status !== "PAID" &&
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
    const tables = await this.getTables()
    const table = tables.find((t: Table) => t.tableNumber === tableNumber)
    if (table) await this.updateTableStatus(table.id, "OCCUPIED")
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
    const response = await fetch(`${CONFIG.API_URL}/table-reservation/tables`)
    if (!response.ok) throw new Error("Failed to load tables")
    const tables = await response.json()
    return withActiveOrderStatuses(tables.map(mapTable))
  }

  async updateTableStatus(
    tableId: string,
    status: TableStatus
  ): Promise<Table> {
    const pathByStatus: Record<TableStatus, string> = {
      AVAILABLE: "available",
      RESERVED: "reserved",
      OCCUPIED: "occupied",
      OUT_OF_ORDER: "out-of-order",
    }
    const response = await fetch(
      `${CONFIG.API_URL}/table-reservation/tables/${tableId}/${pathByStatus[status]}`,
      { method: "PATCH" }
    )
    if (!response.ok) throw new Error("Failed to update table status")
    const tables = await this.getTables()
    const table = tables.find((candidate) => candidate.id === tableId)
    if (!table) throw new Error("Updated table not found")
    return table
  }

  async getOrdersByTable(tableNumber: string): Promise<Order[]> {
    const table = await this.findTableByNumber(tableNumber)
    const session = await fetchActiveOrderSession(table.id)
    if (!session) return readCachedTableOrders(tableNumber)

    rememberOrderSession(table.id, session.sessionId)
    const menuItemsById = await fetchMenuItemsById()
    const orders = (session.orders ?? [])
      .map((order) => mapOrder(order, table.tableNumber, [], menuItemsById))
      .filter(
        (order) => order.status !== "PAID" && order.status !== "CANCELLED"
      )

    writeCachedTableOrders(table.tableNumber, orders)
    return orders
  }

  async placeOrderForTable(
    tableNumber: string,
    items: Order["items"]
  ): Promise<Order> {
    const table = await this.findTableByNumber(tableNumber)
    const sessionId = await getOrOpenOrderSession(table.id)
    const res = await fetch(
      `${CONFIG.API_URL}/order-menu/order-sessions/${sessionId}/orders`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((item) => ({
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            modifiers: [],
            specialInstructions: item.specialInstructions ?? "",
          })),
        }),
      }
    )
    if (!res.ok) throw new Error("Failed to place order")
    const order = mapOrder(await res.json(), table.tableNumber, items)
    cacheTableOrder(table.tableNumber, order)
    if (table.status !== "OCCUPIED") {
      await this.updateTableStatus(table.id, "OCCUPIED")
    }
    return order
  }

  async checkoutTable(tableNumber: string): Promise<void> {
    const table = await this.findTableByNumber(tableNumber)
    const session = await fetchActiveOrderSession(table.id)
    if (session) {
      const response = await fetch(
        `${CONFIG.API_URL}/order-menu/order-sessions/${session.sessionId}/close`,
        { method: "PUT" }
      )
      if (!response.ok) throw new Error("Failed to close order session")
    }

    const orders = readCachedTableOrders(tableNumber).map((order) => ({
      ...order,
      status: order.status === "CANCELLED" ? order.status : ("PAID" as const),
    }))
    writeCachedTableOrders(tableNumber, orders)
    forgetOrderSession(table.id)
  }

  private async findTableByNumber(tableNumber: string): Promise<Table> {
    const tables = await this.getTables()
    const table = tables.find((candidate) => candidate.tableNumber === tableNumber)
    if (!table) throw new Error(`Table ${tableNumber} not found`)
    return table
  }
}

export const tableApi: ITableApi = CONFIG.IS_MOCK
  ? new MockTableApi()
  : new RealTableApi()

type BackendTable = {
  tableId: string
  tableNumber: string
  capacity: number
  status: string
}

type BackendOrder = {
  orderId: string
  status: Order["status"]
  placedAt: string
  subtotal: number | string
  items: BackendOrderItem[]
}

type BackendOrderItem = {
  itemId: string
  menuItemId: string
  quantity: number
  unitPrice?: number | string
  subtotal?: number | string
  menuItemName?: string
  specialInstructions?: string | null
}

type BackendOrderSession = {
  sessionId: string
  tableId: string
  status: string
  openedAt: string
  closedAt?: string | null
  orders?: BackendOrder[]
  subtotal?: number | string
}

type BackendMenu = {
  items?: BackendMenuItem[]
}

type BackendMenuItem = {
  itemId: string
  name: string
  price: number | string
}

function mapTable(table: BackendTable): Table {
  return {
    id: table.tableId,
    tableNumber: table.tableNumber,
    capacity: table.capacity,
    status: mapTableStatus(table.status),
  }
}

function mapTableStatus(status: string): TableStatus {
  if (status === "FREE") return "AVAILABLE"
  return status as TableStatus
}

async function getOrOpenOrderSession(tableId: string): Promise<string> {
  const key = `real_order_session:${tableId}`
  const activeSession = await fetchActiveOrderSession(tableId)
  if (activeSession) {
    rememberOrderSession(tableId, activeSession.sessionId)
    return activeSession.sessionId
  }

  const saved = typeof window === "undefined" ? null : localStorage.getItem(key)
  if (saved) {
    const savedSession = await fetchOrderSession(saved)
    if (savedSession?.status === "OPEN") return saved
    forgetOrderSession(tableId)
  }

  const response = await fetch(`${CONFIG.API_URL}/order-menu/order-sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableId }),
  })
  if (!response.ok) throw new Error("Failed to open order session")
  const session = await response.json()
  rememberOrderSession(tableId, session.sessionId)
  return session.sessionId
}

function mapOrder(
  backendOrder: BackendOrder,
  tableNumber: string,
  originalItems: Order["items"],
  menuItemsById: Map<string, BackendMenuItem> = new Map()
): Order {
  const items = backendOrder.items.map((item) => {
    const original = originalItems.find((candidate) => candidate.menuItemId === item.menuItemId)
    const menuItem = menuItemsById.get(item.menuItemId)
    return {
      id: item.itemId,
      menuItemId: item.menuItemId,
      menuItemName: original?.menuItemName ?? item.menuItemName ?? menuItem?.name ?? item.menuItemId,
      quantity: item.quantity,
      price: Number(item.unitPrice ?? menuItem?.price ?? original?.price ?? 0),
      specialInstructions: item.specialInstructions ?? undefined,
    }
  })

  return {
    id: backendOrder.orderId,
    tableNumber,
    status: backendOrder.status,
    items,
    total: Number(backendOrder.subtotal),
    createdAt: backendOrder.placedAt,
  }
}

async function fetchActiveOrderSession(
  tableId: string
): Promise<BackendOrderSession | null> {
  const response = await fetch(
    `${CONFIG.API_URL}/order-menu/order-sessions/table/${tableId}`
  )
  if (!response.ok) return null
  return response.json()
}

async function fetchOrderSession(
  sessionId: string
): Promise<BackendOrderSession | null> {
  const response = await fetch(
    `${CONFIG.API_URL}/order-menu/order-sessions/${sessionId}`
  )
  if (!response.ok) return null
  return response.json()
}

async function fetchMenuItemsById(): Promise<Map<string, BackendMenuItem>> {
  const response = await fetch(`${CONFIG.API_URL}/order-menu/menu`)
  if (!response.ok) return new Map()
  const menu: BackendMenu = await response.json()
  return new Map((menu.items ?? []).map((item) => [item.itemId, item]))
}

function readCachedTableOrders(tableNumber: string): Order[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem(`real_table_orders:${tableNumber}`)
  return saved ? JSON.parse(saved) : []
}

function writeCachedTableOrders(tableNumber: string, orders: Order[]): void {
  if (typeof window === "undefined") return
  localStorage.setItem(`real_table_orders:${tableNumber}`, JSON.stringify(orders))
}

function cacheTableOrder(tableNumber: string, order: Order): void {
  const orders = readCachedTableOrders(tableNumber)
  orders.push(order)
  writeCachedTableOrders(tableNumber, orders)
}

function rememberOrderSession(tableId: string, sessionId: string): void {
  if (typeof window === "undefined") return
  localStorage.setItem(`real_order_session:${tableId}`, sessionId)
}

function forgetOrderSession(tableId: string): void {
  if (typeof window === "undefined") return
  localStorage.removeItem(`real_order_session:${tableId}`)
}

function withActiveOrderStatuses(tables: Table[]): Table[] {
  if (typeof window === "undefined") return tables
  return tables.map((table) => {
    const orders = CONFIG.IS_MOCK
      ? readMockTableOrders(table.tableNumber)
      : readCachedTableOrders(table.tableNumber)
    const activeOrders = orders.filter(
      (order) => order.status !== "PAID" && order.status !== "CANCELLED"
    )
    return activeOrders.length > 0 ? { ...table, status: "OCCUPIED" } : table
  })
}

function readMockTableOrders(tableNumber: string): Order[] {
  if (typeof window === "undefined") return []
  const saved = localStorage.getItem("mock_orders")
  const orders: Order[] = saved ? JSON.parse(saved) : []
  return orders.filter((order) => order.tableNumber === tableNumber)
}
