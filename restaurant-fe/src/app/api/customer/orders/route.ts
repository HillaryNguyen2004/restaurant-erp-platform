import { Order } from "@/app/types/customer.types";
import { cartStore } from "../cart/route";

let MOCK_ORDERS: Order[] = [];

export async function POST(request: Request) {
  const { table } = await request.json();

  if (cartStore.items.length === 0)
    return Response.json({ error: "Empty cart" }, { status: 400 });

  const newOrder: Order = {
    id: `ORD-${Date.now()}`,
    table,
    items: [...cartStore.items],
    total: cartStore.items.reduce((sum, i) => sum + i.price * i.qty, 0),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  MOCK_ORDERS.push(newOrder);
  cartStore.items.length = 0;

  return Response.json(newOrder);
}
