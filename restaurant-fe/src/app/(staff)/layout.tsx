"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { Bell, LayoutDashboard, ListOrdered, LogOut, Map } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "staff")) {
            router.push("/auth/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return null;

    return (
        <div className="min-h-screen flex bg-slate-50">
            {/* Sidebar Desktop */}
            <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 bg-amber-900 text-amber-50 shadow-2xl">
                <div className="p-6">
                    <h2 className="text-2xl font-bold tracking-tighter flex items-center gap-2">
                        <div className="w-8 h-8 rounded bg-amber-500 flex items-center justify-center">
                            <span className="text-amber-950 font-black">P</span>
                        </div>
                        POS Pro
                    </h2>
                </div>
                <nav className="flex-1 px-4 py-4 space-y-2">
                    <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-800 text-amber-100">
                        <Map className="w-5 h-5" /> Sơ đồ bàn
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-800 text-amber-100">
                        <ListOrdered className="w-5 h-5" /> Danh sách Order
                    </Button>
                    <Button variant="ghost" className="w-full justify-start gap-3 hover:bg-amber-800 text-amber-100">
                        <LayoutDashboard className="w-5 h-5" /> POS Home
                    </Button>
                </nav>
                <div className="p-4 border-t border-amber-800">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-amber-950 font-bold">
                            {user.email[0].toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-semibold truncate w-32">{user.email}</span>
                            <span className="text-xs text-amber-400">Staff Mode</span>
                        </div>
                    </div>
                    <Button variant="outline" className="w-full border-amber-700 hover:bg-amber-800 text-amber-100 gap-2" onClick={() => logout()}>
                        <LogOut className="w-4 h-4" /> Đăng xuất
                    </Button>
                </div>
            </aside>

            <div className="flex-1 lg:ml-64 flex flex-col">
                <header className="h-16 bg-white border-b flex items-center justify-between px-6 sticky top-0 z-40">
                    <h2 className="font-bold text-amber-900 lg:hidden">POS Pro</h2>
                    <div className="flex-1" />
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="relative text-slate-600">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                        </Button>
                    </div>
                </header>
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
