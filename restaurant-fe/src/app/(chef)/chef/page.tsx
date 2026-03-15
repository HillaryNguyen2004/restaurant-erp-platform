"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Clock } from "lucide-react";

const TICKETS = [
    {
        id: "B12",
        table: "Bàn 06",
        time: "12:15",
        elapsed: "14m",
        priority: "high",
        items: [
            { name: "Phở Bò Đặc Biệt", qty: 2, note: "Không hành lá", status: "cooking" },
            { name: "Bún Chả Hà Nội", qty: 1, note: "Thêm nem", status: "pending" },
        ]
    },
    {
        id: "B15",
        table: "Bàn 01",
        time: "12:25",
        elapsed: "4m",
        priority: "normal",
        items: [
            { name: "Cơm Tấm Sườn Bì", qty: 3, note: "", status: "pending" },
        ]
    },
    {
        id: "B10",
        table: "Bàn 03",
        time: "12:05",
        elapsed: "24m",
        priority: "urgent",
        items: [
            { name: "Gỏi Cuốn Tôm Thịt", qty: 4, note: "Dị ứng lạc", status: "started" },
            { name: "Cà Phê Sữa Đá", qty: 2, note: "Nhiều đá", status: "ready" },
        ]
    },
];

export default function ChefKDSPage() {
    return (
        <div className="flex gap-6 overflow-x-auto pb-6 h-full min-h-[calc(100vh-140px)]">
            {TICKETS.map((ticket) => (
                <Card
                    key={ticket.id}
                    className={cn(
                        "w-80 flex-shrink-0 border-none bg-slate-900 shadow-2xl flex flex-col h-fit animate-in zoom-in-95 duration-300",
                        ticket.priority === "urgent" ? "ring-2 ring-rose-500" : ""
                    )}
                >
                    <CardHeader className={cn(
                        "p-4 border-b flex flex-row items-center justify-between space-y-0",
                        ticket.priority === "urgent" ? "bg-rose-900/40" :
                            ticket.priority === "high" ? "bg-amber-900/40" : "bg-slate-800"
                    )}>
                        <div>
                            <CardTitle className="text-xl font-black text-white italic">#{ticket.id} - {ticket.table}</CardTitle>
                            <div className="flex items-center gap-2 mt-1">
                                <Clock className="w-3 h-3 text-slate-400" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{ticket.elapsed} ago</span>
                            </div>
                        </div>
                        {ticket.priority === "urgent" && <AlertCircle className="text-rose-500 w-6 h-6 animate-pulse" />}
                    </CardHeader>
                    <CardContent className="p-0 flex-1">
                        <div className="divide-y divide-slate-800">
                            {ticket.items.map((item, idx) => (
                                <div key={idx} className="p-4 space-y-2 group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-3">
                                            <span className="text-xl font-black text-rose-500">{item.qty}x</span>
                                            <div>
                                                <p className="font-bold text-slate-100">{item.name}</p>
                                                {item.note && (
                                                    <p className="text-[10px] inline-block px-1.5 py-0.5 bg-rose-500 text-white font-black uppercase mt-1">
                                                        {item.note}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-tighter",
                                            item.status === "ready" ? "bg-green-600" :
                                                item.status === "cooking" ? "bg-amber-600" : "bg-slate-700"
                                        )}>
                                            {item.status}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <div className="p-4 bg-slate-900 border-t border-slate-800">
                        <Button className="w-full bg-rose-600 hover:bg-rose-700 text-white font-black tracking-widest uppercase h-12 gap-2 shadow-lg shadow-rose-900/40">
                            HOÀN TẤT ALL <CheckCircle2 className="w-5 h-5" />
                        </Button>
                    </div>
                </Card>
            ))}

            <Card className="w-80 flex-shrink-0 border-2 border-dashed border-slate-800 bg-transparent flex items-center justify-center opacity-40">
                <p className="text-slate-500 font-bold uppercase tracking-widest">Đang chờ đơn mới...</p>
            </Card>
        </div>
    );
}
