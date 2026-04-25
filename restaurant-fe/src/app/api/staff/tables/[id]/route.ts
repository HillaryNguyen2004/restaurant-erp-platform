import { NextRequest } from "next/server";
import { tableStore } from "../route";
import { TableStatus } from "@/app/types/staff.types";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { status } = (await request.json()) as { status: TableStatus };

  const table = tableStore.tables.find((t) => t.id === id);
  if (!table)
    return Response.json({ error: "Invalid table ID" }, { status: 404 });

  table.status = status;

  // Reset
  if (status === "available") {
    table.orders = 0;
    table.time = "-";
    table.alert = false;
  }

  return Response.json({ success: true, table });
}
