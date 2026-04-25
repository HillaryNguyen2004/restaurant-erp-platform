import type { AdminStats, TopItem, RecentOrder } from "@/app/types/admin.types";

export async function getAdminStats(): Promise<AdminStats> {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) throw new Error("Lỗi tải stats");
  return res.json();
}

export async function getTopItems(): Promise<TopItem[]> {
  const res = await fetch("/api/admin/top-items");
  if (!res.ok) throw new Error("Lỗi tải top items");
  return res.json();
}

export async function getRecentOrders(): Promise<RecentOrder[]> {
  const res = await fetch("/api/admin/recent-orders");
  if (!res.ok) throw new Error("Lỗi tải recent orders");
  return res.json();
}
