"use client";
import { useTables, useUpdateTableStatus } from "@/features/table/data-access/table.queries";
import { useMenuItems } from "@/features/menu/data-access/menu.queries";
import { Table } from "@/features/table/config/table.config";
import { MenuItemInput } from "@/features/menu/config/menu.config";
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
import { toast } from "sonner";

interface OrderItem {
  menuItemId: string;
  name: string;
  price: number;
  qty: number;
}

export default function StaffTablePage() {
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);

  const { data: tables = [], isLoading: tableLoading } = useTables();
  const { data: menuItems = [], isLoading: menuLoading } = useMenuItems();
  const updateTableStatusMutation = useUpdateTableStatus();

  const addOrderItem = (item: MenuItemInput) => {
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
          menuItemId: item.id!,
          name: item.name,
          price: item.price,
          qty: 1,
        },
      ]);
    }
  };

  const statusConfig: Record<string, { label: string; color: string }> = {
    AVAILABLE: {
      label: "Trống",
      color: "bg-emerald-50 border-emerald-300 text-emerald-700",
    },
    OCCUPIED: {
      label: "Đang ngồi",
      color: "bg-amber-50  border-amber-300  text-amber-700",
    },
    MAINTENANCE: {
      label: "Bảo trì",
      color: "bg-blue-50   border-blue-300   text-blue-700",
    },
    RESERVED: {
      label: "Đã đặt",
      color: "bg-purple-50 border-purple-300 text-purple-700",
    },
  };

  const nextStatus: Record<string, string> = {
    OCCUPIED: "MAINTENANCE",
    MAINTENANCE: "AVAILABLE",
    AVAILABLE: "OCCUPIED",
    RESERVED: "OCCUPIED",
  };

  if (tableLoading)
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-6">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-32 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-amber-900">Sơ đồ bàn ăn</h2>
        <p className="text-sm text-slate-500">Quản lý trạng thái bàn và đặt món nhanh.</p>
      </div>

      {/* Table Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tables.map((table: Table) => (
          <Card
            key={table.id}
            className={cn(
              "border-2 cursor-pointer transition-all hover:shadow-lg active:scale-95",
              statusConfig[table.status].color,
              selectedTable?.id === table.id && "ring-4 ring-amber-500 ring-offset-2"
            )}
            onClick={() => setSelectedTable(table)}
          >
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-bold text-lg">Bàn {table.number}</span>
                {table.status === "OCCUPIED" && (
                  <UtensilsCrossed className="w-4 h-4 text-amber-600 animate-bounce" />
                )}
              </div>

              <Badge variant="outline" className="text-[10px] font-bold uppercase">
                {statusConfig[table.status].label}
              </Badge>

              <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" /> {table.capacity} chỗ
                </span>
              </div>

              <Button
                size="sm"
                variant="secondary"
                className="w-full text-[10px] h-7 bg-white/50 hover:bg-white"
                onClick={(e) => {
                  e.stopPropagation();
                  updateTableStatusMutation.mutate({
                    id: table.id,
                    status: nextStatus[table.status],
                  });
                }}
              >
                Chuyển sang {statusConfig[nextStatus[table.status]].label}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* POS Panel */}
      {selectedTable && (
        <Card className="border-2 border-amber-100 bg-amber-50/50 shadow-inner overflow-hidden">
          <div className="p-4 bg-amber-100/50 border-b border-amber-200 flex justify-between items-center">
            <h3 className="font-bold text-amber-900 flex items-center gap-2">
              <Plus className="w-5 h-5" /> Đặt món cho Bàn {selectedTable.number}
            </h3>
            <Button variant="ghost" size="sm" onClick={() => setSelectedTable(null)}>Đóng</Button>
          </div>
          
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <p className="text-sm font-bold text-amber-800 uppercase tracking-widest">Thực đơn</p>
              <div className="grid grid-cols-2 gap-2 h-64 overflow-y-auto pr-2">
                {menuLoading ? (
                  <p>Đang tải món...</p>
                ) : (
                  menuItems.map((item: MenuItemInput) => (
                    <Button
                      key={item.id}
                      variant="outline"
                      className="flex flex-col items-start h-auto py-3 px-4 bg-white hover:border-amber-500 hover:bg-amber-50"
                      onClick={() => addOrderItem(item)}
                    >
                      <span className="text-sm font-bold truncate w-full">{item.name}</span>
                      <span className="text-xs text-emerald-600 font-bold">
                        {item.price.toLocaleString()}đ
                      </span>
                    </Button>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-3 bg-white p-4 rounded-xl shadow-sm border">
              <p className="text-sm font-bold text-amber-800 uppercase tracking-widest">Danh sách đã chọn</p>
              <div className="space-y-2 h-48 overflow-y-auto pr-2">
                {orderItems.length === 0 ? (
                  <p className="text-sm text-slate-400 italic text-center py-10">Chưa có món nào được chọn</p>
                ) : (
                  orderItems.map((item) => (
                    <div
                      key={item.menuItemId}
                      className="flex justify-between items-center text-sm border-b pb-2 last:border-0"
                    >
                      <div>
                        <span className="font-bold">{item.name}</span>
                        <span className="text-slate-400 ml-2">x{item.qty}</span>
                      </div>
                      <span className="font-bold">{(item.price * item.qty).toLocaleString()}đ</span>
                    </div>
                  ))
                )}
              </div>
              
              {orderItems.length > 0 && (
                <div className="pt-4 border-t-2 border-dashed space-y-4">
                  <div className="flex justify-between items-center text-lg font-black text-amber-950">
                    <span>Tổng cộng</span>
                    <span>
                      {orderItems
                        .reduce((s, i) => s + i.price * i.qty, 0)
                        .toLocaleString()}
                      đ
                    </span>
                  </div>
                  <Button
                    className="w-full h-12 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl"
                    onClick={() => {
                        toast.success("Order submitted to kitchen!");
                        setSelectedTable(null);
                        setOrderItems([]);
                    }}
                  >
                    Gửi yêu cầu tới nhà bếp 👨‍🍳
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
