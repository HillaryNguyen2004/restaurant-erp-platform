"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    ArrowDownRight,
    ArrowUpRight,
    BarChart3,
    DollarSign,
    Package,
    TrendingUp,
    Users,
    Utensils
} from "lucide-react";

export default function AdminDashboardPage() {
    const stats = [
        { label: "Doanh thu ngày", value: "12,450,000đ", change: "+12.5%", icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-50" },
        { label: "Đơn hàng mới", value: "148", change: "+8.2%", icon: Utensils, color: "text-indigo-500", bg: "bg-indigo-50" },
        { label: "Khách hàng", value: "2,150", change: "+2.1%", icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
        { label: "Hết hàng", value: "4", change: "-2 món", icon: Package, color: "text-rose-500", bg: "bg-rose-50" },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight">Tổng quan kinh doanh</h2>
                    <p className="text-slate-500 font-medium">Chào mừng trở lại, đây là những gì đang diễn ra hôm nay.</p>
                </div>
                <Button className="bg-indigo-600 hover:bg-indigo-700 font-bold shadow-lg shadow-indigo-100 uppercase tracking-widest text-xs h-10 px-6">
                    Tải báo cáo <ArrowUpRight className="w-4 h-4 ml-2" />
                </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="border-none shadow-sm hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className={stat.bg + " p-3 rounded-2xl " + stat.color}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className={idx % 2 === 0 ? "text-emerald-500" : "text-rose-500" + " flex items-center gap-1 text-xs font-bold"}>
                                    {stat.change} {idx % 2 === 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{stat.label}</p>
                                <h3 className="text-2xl font-black text-slate-900 mt-1">{stat.value}</h3>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2 border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-50 bg-white">
                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-indigo-600" /> Xu hướng doanh thu
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="h-80 flex items-center justify-center bg-slate-50/50">
                        <p className="text-slate-400 font-medium italic">Biểu đồ thống kê sẽ được hiển thị tại đây</p>
                    </CardContent>
                </Card>

                <Card className="border-none shadow-sm overflow-hidden">
                    <CardHeader className="p-6 border-b border-slate-50 bg-white">
                        <CardTitle className="text-lg font-bold">Món chạy nhất</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="divide-y divide-slate-50">
                            {[
                                { name: "Phở Bò", sales: 145, trend: "+12%" },
                                { name: "Gỏi Cuốn", sales: 98, trend: "+5%" },
                                { name: "Cơm Tấm", sales: 86, trend: "-2%" },
                                { name: "Cà Phê Sữa", sales: 74, trend: "+8%" },
                            ].map((item, i) => (
                                <div key={i} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                                    <span className="font-bold text-slate-700">{item.name}</span>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900">{item.sales}</p>
                                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-tighter">{item.trend}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 flex items-center justify-center">
                            <Button variant="ghost" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 uppercase tracking-tighter">Xem chi tiết</Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
