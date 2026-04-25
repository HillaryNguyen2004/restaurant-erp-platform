"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Role, useAuth } from "@/providers/auth-provider";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChefHat,
  GlassWater,
  ShieldCheck,
  Sparkles,
  Store,
  UserCircle2,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function LandingPage() {
  const { login, user } = useAuth();
  const router = useRouter();

  const handleRoleQuickAccess = (role: Role) => {
    login(role);
    router.push(`/${role}`);
  };

  const roles = [
    {
      id: "customer",
      title: "Customer",
      desc: "Watch Menu, Order & Pay",
      icon: GlassWater,
      color: "bg-emerald-500",
      hover: "hover:bg-emerald-600",
      shadow: "shadow-emerald-200",
    },
    {
      id: "staff",
      title: "Staff",
      desc: "Manage tables, place orders at POS",
      icon: Store,
      color: "bg-amber-500",
      hover: "hover:bg-amber-600",
      shadow: "shadow-amber-200",
    },
    {
      id: "chef",
      title: "Chef",
      desc: "Smart Kitchen Display System (KDS)",
      icon: ChefHat,
      color: "bg-rose-500",
      hover: "hover:bg-rose-600",
      shadow: "shadow-rose-200",
    },
    {
      id: "admin",
      title: "Admin",
      desc: "Manage & Generate Sales Reports",
      icon: ShieldCheck,
      color: "bg-indigo-600",
      hover: "hover:bg-indigo-700",
      shadow: "shadow-indigo-200",
    },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/40 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/40 rounded-full blur-[120px]" />

      <div className="max-w-4xl w-full relative z-10 space-y-12 text-center">
        <header className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <Sparkles className="w-3 h-3 text-amber-500" /> Intelligent
            Restaurant
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tighter leading-none">
            Demo Portal <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-indigo-600 italic">
              Smart Solution
            </span>
          </h1>
          <p className="text-lg text-slate-500 font-medium max-w-xl mx-auto">
            Select a role to start exploring the intelligent restaurant
            management system.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roles.map((role, idx) => (
            <motion.button
              key={role.id}
              whileHover={{ y: -8 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleRoleQuickAccess(role.id as Role)}
              className={`p-6 bg-white border border-slate-100 rounded-3xl text-left shadow-xl ${role.shadow} hover:shadow-2xl transition-all duration-300 group relative overflow-hidden`}
            >
              <div
                className={`w-12 h-12 ${role.color} rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
              >
                <role.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 group-hover:text-slate-700">
                {role.title}
              </h3>
              <p className="text-xs text-slate-400 mt-2 font-medium leading-relaxed">
                {role.desc}
              </p>

              <div className="mt-6 flex items-center gap-2 text-slate-900 font-bold text-[10px] uppercase tracking-widest">
                Try it now <ArrowRight className="w-4 h-4" />
              </div>

              {/* Subtle accent border at bottom on hover */}
              <div
                className={`absolute bottom-0 left-0 h-1 w-0 ${role.color} transition-all duration-500 group-hover:w-full`}
              />
            </motion.button>
          ))}
        </div>

        {user && (
          <div className="pt-8 border-t border-slate-50 flex flex-col items-center gap-4">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
              <UserCircle2 className="text-indigo-500 w-5 h-5" />
              <span className="text-sm font-bold text-slate-700">
                Logged in as:{" "}
                <span className="text-indigo-600">{user.email}</span>
              </span>
              <Badge className="bg-indigo-600 uppercase text-[9px] font-black">
                {user.role}
              </Badge>
            </div>
            <Button
              asChild
              variant="link"
              className="text-slate-400 hover:text-slate-600 font-bold uppercase text-[10px] tracking-widest"
            >
              <a href={`/${user.role}`}>Return to Your Dashboard</a>
            </Button>
          </div>
        )}

        {!user && (
          <div className="pt-8 border-t border-slate-50">
            <Button
              asChild
              size="lg"
              className="rounded-full bg-slate-900 text-white font-bold px-10 h-14 hover:bg-slate-800 shadow-xl shadow-slate-200"
            >
              <a href="/auth/login">Log in to Your Account</a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
