"use client";
import { useQuery } from "@tanstack/react-query";
import {
  getAdminStats,
  getTopItems,
  getRecentOrders,
} from "@/app/services/admin.service";
import {
  DollarSign,
  Utensils,
  Users,
  Package,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminDashboardPage() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchInterval: 30 * 1000, // Tự refetch mỗi 30 giây
  });

  const { data: topItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-top-items"],
    queryFn: getTopItems,
  });

  const { data: recentOrders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-recent-orders"],
    queryFn: getRecentOrders,
    refetchInterval: 10 * 1000, // Refetch mỗi 10 giây vì orders thay đổi nhanh
  });

  // Map data từ API vào format render
  const statCards = stats
    ? [
        {
          label: "Daily Revenue",
          value: `${stats.dailyRevenue.toLocaleString()}đ`,
          change: stats.dailyRevenueChange,
          icon: DollarSign,
          color: "text-emerald-500",
          bg: "bg-emerald-50",
        },

        {
          label: "New Orders",
          value: stats.newOrders,
          change: stats.newOrdersChange,
          icon: Utensils,
          color: "text-indigo-500",
          bg: "bg-indigo-50",
        },

        {
          label: "Customers",
          value: stats.customers.toLocaleString(),
          change: stats.customersChange,
          icon: Users,
          color: "text-blue-500",
          bg: "bg-blue-50",
        },

        {
          label: "Out of Stock",
          value: stats.outOfStock,
          change: stats.outOfStockChange,
          icon: Package,
          color: "text-rose-500",
          bg: "bg-rose-50",
        },
      ]
    : [];

  const statusColor = {
    completed: "text-emerald-600 bg-emerald-50",
    pending: "text-amber-600   bg-amber-50",
    preparing: "text-blue-600    bg-blue-50",
  };

  return (
    <div className="p-6 space-y-6">
      <p className="text-gray-500">
        Welcome back, here's what's happening today.
      </p>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statsLoading
          ? [...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 rounded-xl bg-gray-100 animate-pulse"
              />
            ))
          : statCards.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4">
                  <div
                    className={`w-10 h-10 rounded-full ${stat.bg} flex items-center justify-center mb-3`}
                  >
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p
                    className={`text-sm ${stat.change.startsWith("+") ? "text-emerald-500" : "text-rose-500"}`}
                  >
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Items */}
        <Card>
          <CardHeader>
            <CardTitle>Top Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {itemsLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded bg-gray-100 animate-pulse"
                  />
                ))
              : topItems?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm">{item.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {item.sales} sales
                      </span>
                      {item.trend === "up" ? (
                        <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      )}
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>

        {/* Recent Orders */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {ordersLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded bg-gray-100 animate-pulse"
                  />
                ))
              : recentOrders?.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {order.id} — {order.table}
                      </p>
                      <p className="text-xs text-gray-400">
                        {order.time} · {order.items} items
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">
                        {order.total.toLocaleString()}đ
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${statusColor[order.status]}`}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
