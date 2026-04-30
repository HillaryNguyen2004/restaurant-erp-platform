"use client"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table } from "../config/table.config"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { tableApi } from "../data-access/table.api"
import { kdsApi } from "@/features/kds/data-access/kds.api"
import { menuApi } from "@/features/menu/data-access/menu.api"
import { MenuItem } from "@/features/menu/config/menu.config"
import { Order } from "@/features/order/config/order.config"
import {
  CheckCircle,
  Minus,
  Plus,
  ShoppingCart,
  Trash2,
  UtensilsCrossed,
} from "lucide-react"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Printer } from "lucide-react"

interface Props {
  table: Table | null
  onClose: () => void
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

export function TableDetailSheet({ table, onClose }: Props) {
  const queryClient = useQueryClient()
  const [cart, setCart] = useState<CartItem[]>([])

  useEffect(() => {
    setCart([])
  }, [table?.id])

  const { data: orders = [], isLoading: loadingOrders } = useQuery({
    queryKey: ["table-orders", table?.tableNumber],
    queryFn: () => tableApi.getOrdersByTable(table!.tableNumber),
    enabled: !!table,
  })

  const { data: menuItems = [] } = useQuery({
    queryKey: ["menu-items"],
    queryFn: () => menuApi.getItems(),
    enabled: !!table,
  })

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: () => menuApi.getCategories(),
    enabled: !!table,
  })

  const placeMutation = useMutation({
    mutationFn: (items: CartItem[]) =>
      tableApi.placeOrderForTable(
        table!.tableNumber,
        items.map((i) => ({
          id: Math.random().toString(36).substr(2, 9),
          menuItemId: i.menuItemId,
          menuItemName: i.menuItemName,
          quantity: i.quantity,
          price: i.price,
          specialInstructions: "",
        }))
      ),
    onSuccess: async (newOrder) => {
      // Tạo KDS ticket để bếp thấy
      await kdsApi.createTicketFromOrder(newOrder)

      queryClient.invalidateQueries({
        queryKey: ["table-orders", table?.tableNumber],
      })
      queryClient.invalidateQueries({ queryKey: ["tickets"] })
      setCart([])
      toast.success(`Order placed for Table ${table?.tableNumber}!`)
    },
    onError: () => {
      toast.error("Failed to place order. Please try again.")
    },
  })

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.menuItemId === item.id)
      if (existing)
        return prev.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: c.quantity + 1 } : c
        )
      return [
        ...prev,
        {
          menuItemId: item.id,
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
  const checkoutMutation = useMutation({
    mutationFn: () => tableApi.checkoutTable(table!.tableNumber),
    onSuccess: () => {
      tableApi.updateTableStatus(table!.id, "AVAILABLE")
      queryClient.invalidateQueries({
        queryKey: ["table-orders", table?.tableNumber],
      })
      queryClient.invalidateQueries({ queryKey: ["tables"] })
      toast.success(`Table ${table?.tableNumber} checked out!`)
      onClose()
    },
  })
  const handleCheckout = () => checkoutMutation.mutate()

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
        `$${i.price.toFixed(2)}`,
        `$${(i.price * i.quantity).toFixed(2)}`,
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
  const billTotal = orders.reduce((sum, o) => sum + o.total, 0)

  if (!table) return null

  return (
    <Sheet open={!!table} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="mb-4">
          <SheetTitle>Table {table.tableNumber}</SheetTitle>
          <div className="flex items-center gap-3 text-sm text-slate-500">
            <span>Capacity: {table.capacity}</span>
            {orders.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-4" />
                <span className="font-semibold text-slate-700">
                  Bill: ${billTotal.toFixed(2)}
                </span>
              </>
            )}
          </div>
        </SheetHeader>

        <Tabs defaultValue="orders">
          <TabsList className="mb-4 w-full">
            <TabsTrigger value="orders" className="flex-1">
              <UtensilsCrossed className="mr-1.5 h-4 w-4" />
              Orders ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="pos" className="flex-1">
              <ShoppingCart className="mr-1.5 h-4 w-4" />
              POS{" "}
              {cart.length > 0 &&
                `(${cart.reduce((s, i) => s + i.quantity, 0)})`}
            </TabsTrigger>
            <TabsTrigger value="bill" className="flex-1">
              Bill
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bill">
            {/* List */}
            {orders
              .flatMap((o) => o.items)
              .map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>
                    {item.menuItemName} ×{item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
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
                key={order.id}
                className="space-y-3 rounded-xl border border-slate-100 p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-slate-400">
                    #{order.id.slice(-6)}
                  </span>
                  <Badge
                    className={`text-xs ${STATUS_COLOR[order.status] ?? ""}`}
                  >
                    {order.status}
                  </Badge>
                </div>

                <ul className="space-y-1">
                  {order.items.map((item) => (
                    <li key={item.id} className="flex justify-between text-sm">
                      <span className="text-slate-700">
                        {item.menuItemName}
                      </span>
                      <span className="text-slate-400">
                        ×{item.quantity} · $
                        {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="flex items-center justify-between border-t border-slate-50 pt-1 text-sm">
                  <span className="text-xs text-slate-400">
                    {new Date(order.createdAt).toLocaleTimeString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="font-bold">${order.total.toFixed(2)}</span>
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
                (i) => i.categoryId === cat.id && i.isAvailable
              )
              if (catItems.length === 0) return null
              return (
                <div key={cat.id}>
                  <p className="mb-2 text-xs font-bold tracking-widest text-slate-400 uppercase">
                    {cat.name}
                  </p>
                  <div className="space-y-1">
                    {catItems.map((item) => {
                      const inCart = cart.find((c) => c.menuItemId === item.id)
                      return (
                        <div
                          key={item.id}
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
                                onClick={() => updateQty(item.id, -1)}
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
                                onClick={() => updateQty(item.id, 1)}
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
                  onClick={() => placeMutation.mutate(cart)}
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
