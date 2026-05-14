"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/features/auth/components/auth-provider"
import { MenuItem } from "@/features/menu/config/menu.config"
import { getOrderSessionId, Order } from "@/features/order/config/order.config"
import { useSessionByTable } from "@/features/order/data-access/order.queries"
import { useOrderSessionRealtime } from "@/providers/realtime-provider"
import {
  CheckCircle,
  Minus,
  Plus,
  Printer,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Table } from "../config/table.config"

interface Props {
  table: Table | null
  onClose: () => void
  defaultTab?: "orders" | "pos" | "bill"
}

type CartItem = {
  menuItemId: string
  menuItemName: string
  price: number
  quantity: number
}

const STATUS_COLOR: Record<string, string> = {
  PLACED: "bg-blue-100 text-blue-700",
  PREPARING: "bg-amber-100 text-amber-700",
  READY: "bg-emerald-100 text-emerald-700",
  SERVED: "bg-slate-100 text-slate-500",
  CANCELLED: "bg-red-100 text-red-500",
}

import { useCheckoutTable, usePlaceOrder, useTableOrders } from "../data-access/table.queries"

import { useCategories, useGetAllMenuItems } from "@/features/menu/data-access/menu.queries"

export function TableDetailSheet({ table, onClose, defaultTab }: Props) {
  const { user } = useAuth()
  const role = user?.roles?.[0]
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart([])
  }, [table?.tableId])

  const { data: orders = [], isLoading: loadingOrders } = useTableOrders(table?.tableId)
  const { data: orderSession } = useSessionByTable(table?.tableId)
  const orderSessionId = getOrderSessionId(orderSession)
  useOrderSessionRealtime(orderSessionId || undefined, table?.tableId)
  const { data: menuItems = [] } = useGetAllMenuItems()
  const { data: categories = [] } = useCategories()

  const placeMutation = usePlaceOrder()

  // Custom success handler for cart clearing
  const handlePlaceOrder = () => {
    if (!table?.tableId) return;
    placeMutation.mutate({
      tableId: table.tableId,
      items: cart.map((i) => ({
        id: Math.random().toString(36).substr(2, 9),
        menuItemId: i.menuItemId,
        menuItemName: i.menuItemName,
        quantity: i.quantity,
        price: i.price,
        specialInstructions: "",
      }))
    }, {
      onSuccess: () => {
        setCart([])
        toast.success(`Order placed for Table ${table?.tableNumber}!`)
      }
    })
  }

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.itemId)
      if (existing)
        return prev.map((c) =>
          c.menuItemId === item.itemId ? { ...c, quantity: c.quantity + 1 } : c
        )
      return [
        ...prev,
        {
          menuItemId: item.itemId,
          menuItemName: item.name,
          price: item.price,
          quantity: 1,
        },
      ]
    })
  }

  const updateQty = (menuItemId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c.menuItemId === menuItemId
            ? { ...c, quantity: c.quantity + delta }
            : c
        )
        .filter((c) => c.quantity > 0)
    )
  }

  const checkoutMutation = useCheckoutTable()
  const handleCheckout = () => {
    if (!table?.tableId) return;
    checkoutMutation.mutate(table.tableId, {
      onSuccess: () => onClose()
    })
  }

  useEffect(() => {
    const handler = (event: Event) => {
      const customEvent = event as CustomEvent<{
        event: string
        data?: { orderSessionId?: string; tableId?: string }
      }>
      const eventName = customEvent.detail.event
      const data = customEvent.detail.data

      if (
        eventName === "order.session.closed" &&
        (data?.orderSessionId === orderSessionId ||
          data?.tableId === table?.tableId)
      ) {
        setCart([])
        onClose()
      }
    }

    window.addEventListener("realtime_event", handler)
    return () => window.removeEventListener("realtime_event", handler)
  }, [onClose, orderSessionId, table?.tableId])

  const handlePrint = () => {
    const allItems = orders.flatMap((o) => o.items)
    const subtotal = billTotal
    const tax = billTotal * 0.1
    const total = billTotal * 1.1

    const rows = [
      [`Table ${table?.tableNumber} — Bill`],
      [`Date: ${new Date().toLocaleString("vi-VN")}`],
      [],
      ["Item", "Qty", "Unit Price", "Amount"],
      ...allItems.map((i) => [
        i.menuItemName,
        i.quantity,
        `$${i.unitPrice.toFixed(2)}`,
        `$${(i.unitPrice * i.quantity).toFixed(2)}`,
      ]),
      [],
      ["", "", "Subtotal", `$${subtotal.toFixed(2)}`],
      ["", "", "Tax (10%)", `$${tax.toFixed(2)}`],
      ["", "", "TOTAL", `$${total.toFixed(2)}`],
    ]

    const csv = rows.map((r) => r.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `bill-table-${table?.tableNumber}-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0)
  const billTotal = orders.reduce((sum, o) => sum + o.subtotal, 0)

  if (!table) return null

  const isServer = role === "SERVER" || role === "TABLE_STAFF" || role === "ADMIN"
  const isCashier = role === "CASHIER" || role === "ADMIN"

  return (
    <Sheet open={!!table} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl border-l-4 border-slate-900">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-3xl font-black tracking-tighter">TABLE #{table.tableNumber}</SheetTitle>
          <div className="flex items-center gap-3 text-sm font-bold text-slate-400">
            <span>CAPACITY: {table.capacity}</span>
            {orders.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-4 w-0.5 bg-slate-200" />
                <span className="text-emerald-600">
                  CURRENT BILL: ${billTotal.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue={defaultTab || "orders"}>
          <TabsList className="mb-6 w-full h-12 p-1">
            <TabsTrigger value="orders" className="flex-1 font-bold text-slate-500">
              <UtensilsCrossed className="mr-2 h-4 w-4" />
              ORDERS ({orders.length})
            </TabsTrigger>
            {isServer && (
              <TabsTrigger value="pos" className="flex-1 font-bold text-slate-500">
                <ShoppingCart className="mr-2 h-4 w-4" />
                ADD ITEMS{" "}
                {cart.length > 0 &&
                  `(${cart.reduce((s, i) => s + i.quantity, 0)})`}
              </TabsTrigger>
            )}
            {isCashier && (
              <TabsTrigger value="bill" className="flex-1 font-bold text-slate-500">
                BILL & PAY
              </TabsTrigger>
            )}
          </TabsList>

          <TabsContent value="bill">
            {/* List */}
            {orders
              .flatMap((o) => o.items)
              .map((item) => (
                <div key={item.itemId} className="flex justify-between text-sm">
                  <span>
                    {item.menuItemName} ×{item.quantity}
                  </span>
                  <span>${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}

            <Separator />

            {/* Subtotal / Tax / Total */}
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span>${billTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Tax (10%)</span>
                <span>${(billTotal * 0.1).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-black">
                <span>Total</span>
                <span className="text-emerald-600">
                  ${(billTotal * 1.1).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <Button
              onClick={handlePrint}
              variant="outline"
              className="w-full gap-2"
            >
              <Printer className="h-4 w-4" /> Print Bill
            </Button>
            <Button
              onClick={handleCheckout}
              className="w-full gap-2 bg-emerald-600"
            >
              <CheckCircle className="h-4 w-4" /> Mark as Paid
            </Button>
          </TabsContent>
          {/* ── Tab Orders ── */}
          <TabsContent value="orders" className="space-y-3">
            {loadingOrders && (
              <p className="py-8 text-center text-sm text-slate-400">
                Loading...
              </p>
            )}

            {!loadingOrders && orders.length === 0 && (
              <div className="flex flex-col items-center gap-2 py-12 text-slate-400">
                <UtensilsCrossed className="h-8 w-8" />
                <p className="text-sm">No active orders for this table</p>
              </div>
            )}

            {orders.map((order: Order) => (
              <div
                key={order.orderId}
                className="space-y-3 rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    #{order.orderId.slice(-6)}
                  </span>
                  <Badge
                    className={`text-xs ${STATUS_COLOR[order.status] ?? ""}`}
                  >
                    {order.status}
                  </Badge>
                </div>

                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.itemId} className="flex justify-between text-sm">
                      <span className="text-slate-700">
                        {menuItems.find((m) => m.itemId === item.menuItemId)?.name || item.menuItemName ||
                          "Unknown Item"}
                      </span>
                      <span className="text-slate-400">
                        ×{item.quantity} · $
                        {(item.unitPrice * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-slate-50 pt-1 text-sm">
                  <span className="text-xs text-slate-400">
                    {new Date(order.placedAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-bold">${order.subtotal.toFixed(2)}</span>
                </div>
              </div>
            ))}

            {orders.length > 0 && (
              <div className="sticky bottom-0 border-t bg-white pt-3">
                <div className="flex justify-between text-base font-bold">
                  <span>Total Bill</span>
                  <span className="text-emerald-600">
                    ${billTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            )}
          </TabsContent>

          {/* ── Tab POS ── */}
          <TabsContent value="pos" className="space-y-4">
            {categories.map((cat) => {
              const catItems = menuItems.filter(
                (i) => i.categoryId === cat.categoryId && i.available
              )
              if (catItems.length === 0) return null
              return (
                <div key={cat.categoryId}>
                  <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                    {cat.name}
                  </p>
                  <div className="space-y-1">
                    {catItems.map((item) => {
                      const inCart = cart.find((c) => c.menuItemId === item.itemId)
                      return (
                        <div
                          key={item.itemId}
                          className="flex items-center justify-between rounded-lg p-2 hover:bg-slate-50"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-slate-800">
                              {item.name}
                            </p>
                            <p className="text-xs font-bold text-emerald-600">
                              ${item.price}
                            </p>
                          </div>

                          {inCart ? (
                            <div className="flex items-center gap-2">
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQty(item.itemId, -1)}
                              >
                                <Minus className="h-3 w-3" />
                              </Button>
                              <span className="w-5 text-center text-sm font-bold">
                                {inCart.quantity}
                              </span>
                              <Button
                                size="icon"
                                variant="outline"
                                className="h-7 w-7 rounded-full"
                                onClick={() => updateQty(item.itemId, 1)}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="icon"
                              className="h-7 w-7 rounded-full bg-amber-600 hover:bg-amber-700"
                              onClick={() => addToCart(item)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {cart.length > 0 && (
              <div className="sticky bottom-0 space-y-2 border-t bg-white pt-3">
                <div className="max-h-36 space-y-1 overflow-y-auto">
                  {cart.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex items-center justify-between text-sm"
                    >
                      <span className="text-slate-600">
                        {item.menuItemName} ×{item.quantity}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5 text-red-400"
                          onClick={() =>
                            setCart((prev) =>
                              prev.filter(
                                (c) => c.menuItemId !== item.menuItemId
                              )
                            )
                          }
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Order Total</span>
                  <span className="text-amber-600">
                    ${cartTotal.toFixed(2)}
                  </span>
                </div>
                <Button
                  className="w-full bg-amber-600 font-bold hover:bg-amber-700"
                  disabled={placeMutation.isPending}
                  onClick={handlePlaceOrder}
                >
                  {placeMutation.isPending
                    ? "Placing..."
                    : `Place Order · $${cartTotal.toFixed(2)}`}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  )
}
