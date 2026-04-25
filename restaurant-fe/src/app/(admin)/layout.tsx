"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import {
  BarChart3,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  Package,
  Settings,
  Users,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!user || user.role !== "admin")) {
      router.push("/auth/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) return null;

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Mini Sidebar */}
      <aside className="w-20 lg:w-72 flex flex-col border-r bg-white dark:bg-slate-900 sticky top-0 h-screen transition-all duration-300 group">
        <div className="h-16 flex items-center px-6 border-b">
          <div className="w-8 h-8 rounded bg-indigo-600 flex-shrink-0 flex items-center justify-center font-bold text-white">
            A
          </div>
          <h1 className="ml-3 font-bold text-xl hidden lg:block overflow-hidden transition-all uppercase tracking-tight">
            Admin Console
          </h1>
        </div>
        <nav className="flex-1 py-6 px-4 space-y-1">
          {[
            { icon: LayoutDashboard, label: "Dashboard", role: "all" },
            { icon: MenuIcon, label: "Menu Management", role: "all" },
            { icon: Package, label: "Inventory", role: "all" },
            { icon: Users, label: "Staff", role: "all" },
            { icon: BarChart3, label: "Reports", role: "all" },
            { icon: Settings, label: "Settings", role: "all" },
          ].map((item, idx) => (
            <Button
              key={idx}
              variant="ghost"
              className={cn(
                "w-full justify-center lg:justify-start gap-4 h-12 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600",
                idx === 0 &&
                  "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600",
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="hidden lg:block font-medium">{item.label}</span>
            </Button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <Button
            variant="ghost"
            className="w-full justify-center lg:justify-start gap-4 text-slate-500 hover:text-red-500 h-12"
            onClick={() => logout()}
          >
            <LogOut className="w-5 h-5" />
            <span className="hidden lg:block font-medium">Log out</span>
          </Button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-slate-900 border-b flex items-center justify-between px-8 sticky top-0 z-30">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 dark:text-slate-200 font-medium italic">
              Overview
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold">{user.email}</p>
              <p className="text-[10px] text-indigo-500 font-semibold uppercase tracking-widest">
                Business Owner
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
              <Users className="w-6 h-6" />
            </div>
          </div>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  );
}
