"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { LogOut, ShoppingCart, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && (!user || user.role !== "customer")) {
            router.push("/auth/login");
        }
    }, [user, isLoading, router]);

    if (isLoading || !user) return null;

    return (
        <div className="min-h-screen flex flex-col bg-emerald-50/30">
            <header className="sticky top-0 z-50 w-full border-b border-emerald-100 bg-white/80 backdrop-blur-md">
                <div className="container mx-auto flex h-16 items-center justify-between px-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold">R</span>
                        </div>
                        <h1 className="text-xl font-bold text-emerald-900 hidden sm:block">FreshResto</h1>
                    </div>

                    <nav className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" className="text-emerald-700 hover:bg-emerald-100">
                            <ShoppingCart className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-2 border-l border-emerald-100 pl-4 ml-2">
                            <span className="text-sm font-medium text-emerald-900 hidden md:block">{user.role}</span>
                            <Button variant="ghost" size="icon" onClick={() => logout()} className="text-red-500 hover:bg-red-50">
                                <LogOut className="w-5 h-5" />
                            </Button>
                        </div>
                    </nav>
                </div>
            </header>
            <main className="flex-1 container mx-auto p-4 md:p-6 pb-24">
                {children}
            </main>
            <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-emerald-100 md:hidden flex items-center justify-around px-4">
                <Button variant="ghost" className="flex flex-col gap-1 items-center h-auto text-emerald-600">
                    <User className="w-5 h-5" />
                    <span className="text-[10px]">Account</span>
                </Button>
            </footer>
        </div>
    );
}
