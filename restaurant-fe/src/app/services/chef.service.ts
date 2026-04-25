import type { Ticket, TicketItemStatus } from "@/app/types/chef.types";

export async function getTickets(): Promise<Ticket[]> {
  const res = await fetch("/api/chef/tickets");
  if (!res.ok) throw new Error("Lỗi tải tickets");
  return res.json();
}

export async function updateItemStatus(
  ticketId: string,
  itemId: string,
  status: TicketItemStatus,
): Promise<void> {
  const res = await fetch(`/api/chef/tickets/${ticketId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ itemId, status }),
  });
  if (!res.ok) throw new Error("Lỗi cập nhật status");
}
