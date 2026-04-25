import { NextRequest } from "next/server";
import { cartStore } from "../route";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;
  const { qty } = await request.json();

  const item = cartStore.items.find((i) => i.id === itemId);
  if (!item) return Response.json({ error: "Item not found" }, { status: 404 });

  item.qty = qty;
  return Response.json({ success: true });
}

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const { itemId } = await params;

  const index = cartStore.items.findIndex((i) => i.id === itemId);
  if (index === -1)
    return Response.json({ error: "Item not found" }, { status: 404 });

  cartStore.items.splice(index, 1);
  return Response.json({ success: true });
}
