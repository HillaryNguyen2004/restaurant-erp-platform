"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertTriangle, Clock, Users, UtensilsCrossed } from "lucide-react";

const TABLES = [
    { id: "T1", number: 1, status: "occupied", capacity: 4, orders: 3, time: "45m" },
    { id: "T2", number: 2, status: "available", capacity: 2, orders: 0, time: "-" },
    { id: "T3", number: 3, status: "occupied", capacity: 6, orders: 5, time: "12m" },
    { id: "T4", number: 4, status: "cleaning", capacity: 4, orders: 0, time: "-" },
    { id: "T5", number: 5, status: "reserved", capacity: 2, orders: 0, time: "19:00" },
    { id: "T6", number: 6, status: "occupied", capacity: 4, orders: 2, time: "1h 10m", alert: true },
    { id: "T7", number: 7, status: "available", capacity: 4, orders: 0, time: "-" },
    { id: "T8", number: 8, status: "occupied", capacity: 8, orders: 12, time: "30m" },
];

export default function StaffTablePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tight italic">Sơ đồ bàn trực tuyến</h2>
                <div className="flex gap-2">
                    <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200">Trống (2)</Badge>
                    <Badge variant="outline" className="bg-amber-100 text-amber-700 border-amber-200">Đang ngồi (4)</Badge>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {TABLES.map((table) => (
                    <Card
                        key={table.id}
                        className={cn(
                            "cursor-pointer transition-all duration-200 relative overflow-hidden border-2",
                            table.status === "occupied" ? "border-amber-200 bg-white" :
                                table.status === "available" ? "border-emerald-100 bg-emerald-50/20" :
                                    "border-slate-100 bg-slate-50"
                        )}
                    >
                        {table.alert && (
                            <div className="absolute top-0 right-0 p-1 bg-red-500 text-white animate-pulse">
                                <AlertTriangle className="w-3 h-3" />
                            </div>
                        )}
                        <CardContent className="p-4 space-y-3">
                            <div className="flex justify-between items-start">
                                <span className="text-2xl font-black text-slate-400">#{table.number}</span>
                                <Badge className={cn(
                                    "text-[10px] uppercase font-bold",
                                    table.status === "occupied" ? "bg-amber-500" :
                                        table.status === "available" ? "bg-emerald-500" :
                                            "bg-slate-400"
                                )}>
                                    {table.status}
                                </Badge>
                            </div>

                            <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-500">
                                <div className="flex items-center gap-1">
                                    <Users className="w-3 h-3" /> {table.capacity} chỗ
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" /> {table.time}
                                </div>
                                <div className="flex items-center gap-1 col-span-2">
                                    <UtensilsCrossed className="w-3 h-3" /> {table.orders} món đã gọi
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button className={cn(
                                    "w-full text-xs font-bold h-8 uppercase tracking-widest",
                                    table.status === "available" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-amber-600 hover:bg-amber-700"
                                )}>
                                    {table.status === "available" ? "MỞ BÀN" : "CHI TIẾT"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
