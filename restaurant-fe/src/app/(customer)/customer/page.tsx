"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Filter, Plus, Search } from "lucide-react";

const MOCK_MENU = [
    { id: 1, name: "Phở Bò Đặc Biệt", price: 85000, category: "Món nước", image: "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=400&q=80", tags: ["Bán chạy", "Gluten-Free"] },
    { id: 2, name: "Cơm Tấm Sườn Bì", price: 65000, category: "Cơm", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", tags: [] },
    { id: 3, name: "Bún Chả Hà Nội", price: 75000, category: "Món nước", image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80", tags: ["Đặc biệt"] },
    { id: 4, name: "Gỏi Cuốn Tôm Thịt", price: 45000, category: "Khai vị", image: "https://images.unsplash.com/photo-1512058560550-427499152a05?w=400&q=80", tags: ["Lành mạnh"] },
    { id: 5, name: "Bánh Mì Thịt Nướng", price: 35000, category: "Bánh mì", image: "https://images.unsplash.com/photo-1509722747041-0300ed7007cc?w=400&q=80", tags: ["Bán chạy"] },
    { id: 6, name: "Cà Phê Sữa Đá", price: 29000, category: "Đồ uống", image: "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=400&q=80", tags: [] },
];

export default function CustomerMenuPage() {
    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="space-y-4">
                <h2 className="text-3xl font-black text-emerald-950 tracking-tight">Hôm nay bạn muốn ăn gì?</h2>
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-400 w-4 h-4" />
                        <Input className="pl-10 border-emerald-100 bg-white shadow-sm focus-visible:ring-emerald-500" placeholder="Tìm kiếm món ăn..." />
                    </div>
                    <Button variant="outline" className="border-emerald-200 text-emerald-700 bg-white">
                        <Filter className="w-4 h-4 mr-2" /> Lọc danh mục
                    </Button>
                </div>
            </section>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {MOCK_MENU.map((item) => (
                    <Card key={item.id} className="overflow-hidden border-none shadow-lg hover:shadow-xl transition-all duration-300 group">
                        <div className="relative h-48 overflow-hidden">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                {item.tags.map(tag => (
                                    <Badge key={tag} className="bg-emerald-500/90 text-[10px] uppercase font-bold backdrop-blur-sm border-none">{tag}</Badge>
                                ))}
                            </div>
                        </div>
                        <CardHeader className="p-4 pb-0">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{item.category}</p>
                                    <CardTitle className="text-lg font-bold text-emerald-950">{item.name}</CardTitle>
                                </div>
                                <p className="font-black text-emerald-600">{(item.price / 1000).toFixed(0)}k</p>
                            </div>
                        </CardHeader>
                        <CardFooter className="p-4 pt-4">
                            <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2 shadow-md shadow-emerald-200 active:scale-95 transition-transform">
                                <Plus className="w-4 h-4" /> Thêm vào đơn
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </section>
        </div>
    );
}
