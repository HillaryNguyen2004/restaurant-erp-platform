"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMenu,
  getCart,
  addToCart,
  removeCartItem,
  placeOrder,
} from "@/app/services/customer.service";
import type { MenuItem } from "@/app/types/customer.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";

export default function CustomerMenuPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showCart, setShowCart] = useState(false);

  // Fetch menu
  const { data: menu = [], isLoading: menuLoading } = useQuery({
    queryKey: ["customer-menu"],
    queryFn: getMenu,
  });

  // Fetch Cart
  const { data: cart } = useQuery({
    queryKey: ["customer-cart"],
    queryFn: getCart,
  });

  // Add to cart
  const { mutate: addItem } = useMutation({
    mutationFn: (menuItemId: number) => addToCart(menuItemId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] }),
  });

  // Remove from cart
  const { mutate: removeItem } = useMutation({
    mutationFn: (itemId: string) => removeCartItem(itemId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] }),
  });

  // Place order
  const { mutate: submitOrder, isPending: ordering } = useMutation({
    mutationFn: () => placeOrder("Bàn 05"), // Sau này lấy từ QR code / auth
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer-cart"] });
      setShowCart(false);
      alert("Order placed successfully! 🎉");
    },
  });

  const filteredMenu = menu.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const cartCount = cart?.items.reduce((sum, i) => sum + i.qty, 0) ?? 0;

  return (
    <div className="p-4 space-y-4">
      {/* Search and Cart Button */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
          <Input
            className="pl-9"
            placeholder="Search items..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="outline"
          onClick={() => setShowCart(!showCart)}
          className="relative"
        >
          <ShoppingCart className="w-4 h-4" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-xs rounded-full flex items-center justify-center">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Cart */}
      {showCart && (
        <div className="border rounded-xl p-4 space-y-3 bg-gray-50">
          <h3 className="font-semibold">Cart</h3>
          {cart?.items.length === 0 ? (
            <p className="text-sm text-gray-400">No items in cart</p>
          ) : (
            cart?.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm">
                  {item.name} x{item.qty}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm">
                    {(item.price * item.qty).toLocaleString()}đ
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeItem(item.id)}
                  >
                    <Trash2 className="w-3 h-3 text-rose-500" />
                  </Button>
                </div>
              </div>
            ))
          )}
          {(cart?.items.length ?? 0) > 0 && (
            <>
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>{cart?.total.toLocaleString()}đ</span>
              </div>
              <Button
                className="w-full"
                disabled={ordering}
                onClick={() => submitOrder()}
              >
                {ordering ? "Placing order..." : "Place Order"}
              </Button>
            </>
          )}
        </div>
      )}

      {/* menu */}
      {menuLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-48 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredMenu.map((item: MenuItem) => (
            <Card key={item.id} className="overflow-hidden">
              <img
                src={item.image}
                alt={item.name}
                className="w-full h-32 object-cover"
                loading="lazy"
              />
              <CardHeader className="p-3 pb-1">
                <CardTitle className="text-sm">{item.name}</CardTitle>
                <div className="flex gap-1 flex-wrap">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardFooter className="p-3 pt-1 flex justify-between items-center">
                <span className="font-semibold text-emerald-600">
                  {(item.price / 1000).toFixed(0)}k
                </span>
                <Button size="sm" onClick={() => addItem(item.id)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
