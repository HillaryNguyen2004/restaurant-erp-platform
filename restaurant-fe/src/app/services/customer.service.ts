import type { Cart, MenuItem, Order } from "@/app/types/customer.types";

export async function getMenu(): Promise<MenuItem[]> {
  const res = await fetch("/api/customer/menu");
  if (!res.ok) throw new Error("Error loading menu");
  return res.json();
}

export async function getCart(): Promise<Cart> {
  const res = await fetch("/api/customer/cart");
  if (!res.ok) throw new Error("Error loading cart");
  return res.json();
}

export async function addToCart(menuItemId: number, qty = 1): Promise<Cart> {
  const res = await fetch("/api/customer/cart", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ menuItemId, qty }),
  });
  if (!res.ok) throw new Error("Error adding to cart");
  return res.json();
}

export async function updateCartItem(
  itemId: string,
  qty: number,
): Promise<void> {
  await fetch(`/api/customer/cart/${itemId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ qty }),
  });
}

export async function removeCartItem(itemId: string): Promise<void> {
  await fetch(`/api/customer/cart/${itemId}`, { method: "DELETE" });
}

export async function placeOrder(table: string): Promise<Order> {
  const res = await fetch("/api/customer/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ table }),
  });
  if (!res.ok) throw new Error("Error placing order");
  return res.json();
}
