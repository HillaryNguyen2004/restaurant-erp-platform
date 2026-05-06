"use client";
import { useMenuItems } from "@/features/menu/data-access/menu.queries";
import { MenuItemInput } from "@/features/menu/config/menu.config";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface CartItem extends MenuItemInput {
  qty: number;
}

export default function CustomerMenuPage() {
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);

  const { data: menu = [], isLoading: menuLoading } = useMenuItems();

  const addItemToCart = (item: MenuItemInput) => {
    const existing = cart.find((i) => i.id === item.id);
    if (existing) {
      setCart(cart.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i));
    } else {
      setCart([...cart, { ...item, qty: 1 }]);
    }
    toast.success(`Đã thêm ${item.name} vào giỏ hàng`);
  };

  const removeItemFromCart = (id: string) => {
    setCart(cart.filter((i) => i.id !== id));
  };

  const filteredMenu = menu.filter((item: MenuItemInput) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);
  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);

  return (
    <div className="p-4 space-y-6">
      <div className="space-y-1">
        <h2 className="text-2xl font-black text-emerald-900 tracking-tight">Hôm nay bạn muốn ăn gì?</h2>
        <p className="text-sm text-emerald-600/70 font-medium italic">Khám phá thực đơn tươi ngon của chúng tôi.</p>
      </div>

      {/* Search and Cart Button */}
      <div className="flex gap-3 sticky top-20 z-40 bg-emerald-50/80 backdrop-blur-sm py-2 rounded-2xl">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
          <Input
            className="pl-10 bg-white border-emerald-100 focus:ring-emerald-500 rounded-xl"
            placeholder="Tìm kiếm món ăn..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button
          variant="default"
          onClick={() => setShowCart(!showCart)}
          className="relative rounded-xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white animate-bounce">
              {cartCount}
            </span>
          )}
        </Button>
      </div>

      {/* Cart Drawer-like Panel */}
      {showCart && (
        <Card className="border-2 border-emerald-100 bg-white shadow-2xl rounded-2xl overflow-hidden animate-in slide-in-from-top duration-300">
          <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="font-black text-emerald-900 uppercase tracking-widest text-sm">Giỏ hàng của bạn</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowCart(false)}>Đóng</Button>
          </div>
          <CardHeader className="p-4 space-y-4">
            {cart.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ShoppingCart className="w-12 h-12 text-emerald-100 mx-auto" />
                <p className="text-sm text-emerald-400 font-medium italic">Giỏ hàng đang trống</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex items-center justify-between group">
                    <div className="flex-1">
                      <p className="text-sm font-bold text-emerald-950">{item.name}</p>
                      <p className="text-xs text-emerald-600">x{item.qty} — {(item.price * item.qty).toLocaleString()}đ</p>
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeItemFromCart(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            {cart.length > 0 && (
              <div className="pt-4 border-t-2 border-dashed border-emerald-100 space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold text-emerald-800 uppercase tracking-widest">Tổng tiền</span>
                  <span className="text-xl font-black text-emerald-950">{cartTotal.toLocaleString()}đ</span>
                </div>
                <Button
                  className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-200"
                  onClick={() => {
                    toast.success("Đã gửi đơn hàng! Vui lòng đợi trong giây lát.");
                    setCart([]);
                    setShowCart(false);
                  }}
                >
                  ĐẶT MÓN NGAY
                </Button>
              </div>
            )}
          </CardHeader>
        </Card>
      )}

      {/* Menu Grid */}
      {menuLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-3xl bg-white border border-emerald-50 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMenu.map((item: MenuItemInput) => (
            <Card key={item.id} className="group overflow-hidden rounded-3xl border-none shadow-xl hover:shadow-2xl transition-all duration-500 bg-white">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={item.imageUrl || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60"}
                  alt={item.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <Badge className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-emerald-600 font-black border-none px-3 py-1">
                    NEW
                </Badge>
              </div>
              <CardHeader className="p-5 pb-2">
                <CardTitle className="text-lg font-black text-emerald-950 group-hover:text-emerald-600 transition-colors">{item.name}</CardTitle>
                <p className="text-xs text-slate-400 line-clamp-2 font-medium italic mt-1">
                    {item.description || "Hương vị tuyệt vời từ những nguyên liệu tươi ngon nhất được tuyển chọn kỹ lưỡng."}
                </p>
              </CardHeader>
              <CardFooter className="p-5 pt-2 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Giá chỉ từ</span>
                    <span className="text-xl font-black text-emerald-950">
                        {item.price.toLocaleString()}đ
                    </span>
                </div>
                <Button 
                    size="icon" 
                    className="w-12 h-12 rounded-2xl bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 active:scale-90 transition-all"
                    onClick={() => addItemToCart(item)}
                >
                  <Plus className="w-6 h-6 text-white" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
