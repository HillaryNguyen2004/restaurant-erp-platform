import type {
  Table,
  TableStatus,
  StaffOrder,
  StaffOrderItem,
} from "@/app/types/staff.types";

export async function getTables(): Promise<Table[]> {
  const res = await fetch("/api/staff/tables");
  if (!res.ok) throw new Error("Error fetching tables");
  return res.json();
}

export async function updateTableStatus(
  tableId: string,
  status: TableStatus,
): Promise<void> {
  const res = await fetch(`/api/staff/tables/${tableId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Error updating table status");
}

export async function placeStaffOrder(
  tableId: string,
  items: StaffOrderItem[],
): Promise<StaffOrder> {
  const res = await fetch("/api/staff/orders", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tableId, items }),
  });
  if (!res.ok) throw new Error("Error placing staff order");
  return res.json();
}
