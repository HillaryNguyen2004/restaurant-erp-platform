"use client";
import { LoginForm } from "@/features/auth/components/login-form";

export default function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    );
}