import { StaffOrder, StaffOrderItem } from "@/app/types/staff.types";
import { tableStore } from "../tables/route";

const staffOrders: StaffOrder[] = [];

export async function GET() {
  return Response.json(staffOrders);
}

export async function POST(request: Request) {
  const { tableId, items } = (await request.json()) as {
    tableId: string;
    items: StaffOrderItem[];
  };

  const table = tableStore.tables.find((t) => t.id === tableId);
  if (!table)
    return Response.json({ error: "Invalid table ID" }, { status: 404 });

  if (items.length === 0)
    return Response.json({ error: "No items selected" }, { status: 400 });

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  const newOrder: StaffOrder = {
    id: `ORD-${Date.now()}`,
    tableId,
    tableNumber: table.number,
    items,
    total,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  staffOrders.push(newOrder);

  // Update table status
  table.status = "occupied";
  table.orders += items.length;
  table.time = "Just finished order";

  return Response.json(newOrder);
}
