"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useAuth } from "./auth-provider"
import { Eye, EyeOff, UtensilsCrossed } from "lucide-react"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const { login, isLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await login(email, password)
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-hidden bg-[#0a0a0a]">
      {/* Background pattern */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow  */}
      <div className="pointer-events-none absolute h-[600px] w-[600px] rounded-full bg-amber-500/8 blur-3xl" />

      {/* Card login */}
      <div className="relative w-full max-w-sm space-y-6">
        {/* system name*/}
        <div className="space-y-2 text-center">
          <div className="mb-1 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500 shadow-lg shadow-amber-500/40">
            <UtensilsCrossed className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">ITS</h1>
          <p className="text-sm text-zinc-500">Restaurant Management System</p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-8 shadow-2xl backdrop-blur-sm"
        >
          {/* Email */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Email
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              required
              className="h-11 rounded-xl border-zinc-700 bg-zinc-800 text-white placeholder:text-zinc-600 focus:border-amber-500"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="h-11 rounded-xl border-zinc-700 bg-zinc-800 pr-11 text-white placeholder:text-zinc-600 focus:border-amber-500"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute top-1/2 right-3 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              >
                {showPass ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="submit"
            disabled={isLoading}
            className="mt-1 h-11 w-full rounded-xl bg-amber-500 font-bold text-black shadow-lg shadow-amber-500/25 transition-all hover:bg-amber-400 active:bg-amber-600"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black" />
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <p className="text-center text-xs text-zinc-700">
          © 2026 Intelligent Restaurant System
        </p>
      </div>
    </div>
  )
}
