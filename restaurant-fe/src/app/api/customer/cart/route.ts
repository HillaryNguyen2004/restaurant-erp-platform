import { CartItem } from "@/app/types/customer.types";
import { MOCK_MENU } from "../menu/route";

export const cartStore = {
  items: [] as CartItem[],
};

export async function GET() {
  const total = cartStore.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return Response.json({ items: cartStore.items, total });
}

export async function POST(request: Request) {
  const { menuItemId, qty = 1 } = await request.json();

  const menuItem = MOCK_MENU.find((m) => m.id === menuItemId);
  if (!menuItem)
    return Response.json({ error: "Invalid menu item" }, { status: 404 });

  const existing = cartStore.items.find((i) => i.menuItemId === menuItemId);
  if (existing) {
    existing.qty += qty;
  } else {
    cartStore.items.push({
      id: `cart-${Date.now()}`,
      menuItemId,
      name: menuItem.name,
      price: menuItem.price,
      qty,
    });
  }

  const total = cartStore.items.reduce((sum, i) => sum + i.price * i.qty, 0);
  return Response.json({ items: cartStore.items, total });
}
