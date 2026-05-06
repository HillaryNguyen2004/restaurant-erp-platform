"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/providers/auth-provider";
import { ChefHat, History, LogOut, Settings, Timer } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function ChefLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "chef")) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <header className="h-20 border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-rose-600 flex items-center justify-center shadow-lg shadow-rose-900/40">
            <ChefHat className="text-white w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-widest text-white uppercase italic">
              KDS Central
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              Kitchen Display System
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <div className="hidden md:flex items-center bg-slate-800 rounded-lg p-1 mr-4">
            <Button
              variant="secondary"
              className="gap-2 bg-slate-950 text-rose-500 hover:text-rose-400"
            >
              <Timer className="w-4 h-4" /> being processed (8)
            </Button>
            <Button
              variant="ghost"
              className="gap-2 text-slate-400 hover:text-white"
            >
              <History className="w-4 h-4" /> History
            </Button>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-slate-400 hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-rose-500 hover:bg-rose-950/30"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </nav>
      </header>
      <main className="flex-1 p-6 overflow-x-auto">{children}</main>
    </div>
  );
}
