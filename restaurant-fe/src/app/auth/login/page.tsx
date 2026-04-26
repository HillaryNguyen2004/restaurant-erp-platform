"use client";
import { login } from "@/app/actions/auth";
import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
    const [state, action, pending] = useActionState(login, undefined);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="w-full max-w-sm p-8 bg-white rounded-2xl shadow-md space-y-6">

                <div className="text-center">
                    <h1 className="text-2xl font-bold">Log in</h1>
                    <p className="text-sm text-gray-500 mt-1">Welcome to the Restaurant Management System, please enter your details    </p>
                </div>

                <form action={action} className="space-y-4">
                    <Input name="email" type="email" placeholder="Email" required />
                    <Input name="password" type="password" placeholder="Password" required />

                    {state?.error && (
                        <p className="text-sm text-rose-500">{state.error}</p>
                    )}

                    <Button type="submit" className="w-full" disabled={pending}>
                        {pending ? "Logging in..." : "Log in"}
                    </Button>
                </form>

                {/* Test Account Suggestions   */}
                <div className="text-xs text-gray-400 space-y-1 border-t pt-4">
                    <p className="font-medium text-gray-500 mb-2">Test Accounts:</p>
                    <p>admin@restaurant.com / admin123</p>
                    <p>staff@restaurant.com / staff123</p>
                    <p>chef@restaurant.com / chef123</p>
                    <p>customer@restaurant.com / customer123</p>
                </div>
            </div>
        </div>
    );
}