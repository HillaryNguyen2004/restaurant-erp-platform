"use client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { KitchenTicket } from "@/features/kds/config/kds.config";
import { useQuery } from "@tanstack/react-query";

async function getStaffOrders(): Promise<KitchenTicket[]> {
  const res = await fetch("/api/staff/orders");
  if (!res.ok) throw new Error("Error fetching staff orders");
  return res.json();
}

const statusColor: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  preparing: "bg-blue-100  text-blue-700",
  ready: "bg-emerald-100 text-emerald-700",
  completed: "bg-gray-100  text-gray-500",
};

const statusLabel: Record<string, string> = {
  pending: "Pending",
  preparing: "Preparing",
  ready: "Ready",
  completed: "Completed",
};

export default function StaffOrdersPage() {
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ["staff-orders"],
    queryFn: getStaffOrders,
    refetchInterval: 10 * 1000,
  });

  if (isLoading)
    return (
      <div className="p-6 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-lg font-semibold">Order List</h2>

      {orders.length === 0 ? (
        <p className="text-center text-gray-400 mt-20">No orders available</p>
      ) : (
        orders.map((order) => (
          <Card key={order.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex justify-between text-sm">
                <span>
                  {order.id} — Bàn {order.station}
                </span>
                <Badge className={statusColor[order.status]}>
                  {statusLabel[order.status]}
                </Badge>
              </CardTitle>
              <p className="text-xs text-gray-400">
                {new Date(order.createdAt).toLocaleTimeString("vi-VN")}
              </p>
            </CardHeader>
            <CardContent className="space-y-1">
              {order.items.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} x{item.quantity}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
