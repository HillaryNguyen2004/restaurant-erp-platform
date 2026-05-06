"use client";
import { useMenuItems, useCategories } from "@/features/menu/data-access/menu.queries";
import { useIngredients } from "@/features/inventory/data-access/inventory.queries";
import { useTables } from "@/features/table/data-access/table.queries";
import { MenuItemInput } from "@/features/menu/config/menu.config";
import { Table } from "@/features/table/config/table.config";
import { Ingredient } from "@/features/inventory/config/inventory.config";
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
  const { data: menuItems, isLoading: menuLoading } = useMenuItems();
  const { data: ingredients, isLoading: inventoryLoading } = useIngredients();
  const { data: tables, isLoading: tableLoading } = useTables();
  const { data: categories } = useCategories();

  const isLoading = menuLoading || inventoryLoading || tableLoading;

  const statCards = [
    {
      label: "Total Menu Items",
      value: menuItems?.length || 0,
      change: "+2 this week",
      icon: Utensils,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Low Stock Items",
      value: ingredients?.filter((i: Ingredient) => i.quantity <= i.minThreshold).length || 0,
      change: "-5% from yesterday",
      icon: Package,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
    {
      label: "Occupied Tables",
      value: tables?.filter((t: Table) => t.status === "OCCUPIED").length || 0,
      change: "Normal traffic",
      icon: Users,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      label: "Active Categories",
      value: categories?.length || 0,
      change: "Stable",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-gray-500">
          Welcome back, here's what's happening today.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading
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
                  <p className="text-xs text-gray-400 mt-1 italic">
                    {stat.change}
                  </p>
                </CardContent>
              </Card>
            ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Menu Items Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Menu Items Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {menuLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded bg-gray-100 animate-pulse"
                  />
                ))
              : menuItems?.slice(0, 5).map((item: MenuItemInput) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium">{item.name}</span>
                    <span className="text-sm text-gray-500">
                      {item.price.toLocaleString()}đ
                    </span>
                  </div>
                ))}
          </CardContent>
        </Card>

        {/* Inventory Alerts */}
        <Card>
          <CardHeader>
            <CardTitle>Inventory Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {inventoryLoading
              ? [...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="h-8 rounded bg-gray-100 animate-pulse"
                  />
                ))
              : ingredients?.filter((i: Ingredient) => i.quantity <= i.minThreshold).slice(0, 5).map((ing: Ingredient) => (
                  <div
                    key={ing.id}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm font-medium text-rose-600">{ing.name}</span>
                    <span className="text-xs px-2 py-1 bg-rose-50 text-rose-600 rounded-full font-bold">
                      {ing.quantity} {ing.unit} left
                    </span>
                  </div>
                ))}
            {!inventoryLoading && ingredients?.filter((i: Ingredient) => i.quantity <= i.minThreshold).length === 0 && (
                <p className="text-sm text-emerald-600 font-medium italic text-center py-4">All stock levels are healthy!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
