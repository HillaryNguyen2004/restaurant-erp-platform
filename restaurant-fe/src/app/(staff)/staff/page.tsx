"use client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTables,
  updateTableStatus,
  placeStaffOrder,
} from "@/app/services/staff.service";
import type {
  Table,
  TableStatus,
  StaffOrderItem,
} from "@/app/types/staff.types";
import { MOCK_MENU } from "@/app/api/customer/menu/route";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Clock,
  Plus,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useState } from "react";

export default function StaffTablePage() {
  const queryClient = useQueryClient();
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderItems, setOrderItems] = useState<StaffOrderItem[]>([]);

  // Fetch tables
  const { data: tables = [], isLoading } = useQuery({
    queryKey: ["staff-tables"],
    queryFn: getTables,
    refetchInterval: 10 * 1000,
  });

  // Update table status
  const { mutate: changeStatus } = useMutation({
    mutationFn: ({
      tableId,
      status,
    }: {
      tableId: string;
      status: TableStatus;
    }) => updateTableStatus(tableId, status),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["staff-tables"] }),
  });

  // Place order
  const { mutate: submitOrder, isPending: ordering } = useMutation({
    mutationFn: () => placeStaffOrder(selectedTable!.id, orderItems),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff-tables"] });
      setSelectedTable(null);
      setOrderItems([]);
      alert("Order submitted to kitchen! 🍽️");
    },
  });

  const addOrderItem = (item: (typeof MOCK_MENU)[0]) => {
    const existing = orderItems.find((i) => i.menuItemId === item.id);
    if (existing) {
      setOrderItems(
        orderItems.map((i) =>
          i.menuItemId === item.id ? { ...i, qty: i.qty + 1 } : i,
        ),
      );
    } else {
      setOrderItems([
        ...orderItems,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          qty: 1,
        },
      ]);
    }
  };

  const statusConfig: Record<TableStatus, { label: string; color: string }> = {
    available: {
      label: "Empty",
      color: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
    occupied: {
      label: "Occupied",
      color: "bg-amber-50  border-amber-300  text-amber-700",
    },
    cleaning: {
      label: "Cleaning",
      color: "bg-blue-50   border-blue-300   text-blue-700",
    },
    reserved: {
      label: "Reserved",
      color: "bg-purple-50 border-purple-300 text-purple-700",
    },
  };

  const nextStatus: Record<TableStatus, TableStatus> = {
    occupied: "cleaning",
    cleaning: "available",
    available: "occupied",
    reserved: "occupied",
  };

  if (isLoading)
    return (
      <div className="grid grid-cols-4 gap-3 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-gray-100 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((table) => (
          <Card
            key={table.id}
            className={cn(
              "border-2 cursor-pointer transition-all hover:shadow-md",
              statusConfig[table.status].color,
            )}
            onClick={() => setSelectedTable(table)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Table {table.number}</span>
                {table.alert && (
                  <AlertTriangle className="w-4 h-4 text-rose-500" />
                )}
              </div>

              <Badge variant="outline" className="text-xs">
                {statusConfig[table.status].label}
              </Badge>

              <div className="flex justify-between text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {table.capacity}
                </span>
                <span className="flex items-center gap-1">
                  <UtensilsCrossed className="w-3 h-3" /> {table.orders}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {table.time}
                </span>
              </div>

              {/* Status Change Button */}
              <Button
                size="sm"
                variant="outline"
                className="w-full text-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  changeStatus({
                    tableId: table.id,
                    status: nextStatus[table.status],
                  });
                }}
              >
                → {statusConfig[nextStatus[table.status]].label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* POS */}
      {selectedTable && (
        <div className="border rounded-xl p-4 space-y-4 bg-gray-50">
          <h3 className="font-semibold">
            Place Order for Table {selectedTable.number}
          </h3>

          {/* Menu */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {MOCK_MENU.map((item) => (
              <Button
                key={item.id}
                variant="outline"
                className="flex justify-between h-auto py-2 px-3"
                onClick={() => addOrderItem(item)}
              >
                <span className="text-xs text-left">{item.name}</span>
                <span className="text-xs text-emerald-600 ml-2">
                  {(item.price / 1000).toFixed(0)}k
                </span>
              </Button>
            ))}
          </div>

          {/* Selected Items */}
          {orderItems.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Selected Items:</p>
              {orderItems.map((item) => (
                <div
                  key={item.menuItemId}
                  className="flex justify-between text-sm"
                >
                  <span>
                    {item.name} x{item.qty}
                  </span>
                  <span>{(item.price * item.qty).toLocaleString()}đ</span>
                </div>
              ))}
              <div className="border-t pt-2 flex justify-between font-semibold">
                <span>Total</span>
                <span>
                  {orderItems
                    .reduce((s, i) => s + i.price * i.qty, 0)
                    .toLocaleString()}
                  đ
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  className="flex-1"
                  disabled={ordering}
                  onClick={() => submitOrder()}
                >
                  {ordering ? "Submitting..." : "Submit to Kitchen 🍽️"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedTable(null);
                    setOrderItems([]);
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
