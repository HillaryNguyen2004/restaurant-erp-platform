"use client";
import { RegisterForm } from "@/features/auth/components/register-form";

export default function RegisterPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
            <div className="w-full max-w-lg">
                <RegisterForm />
            </div>
        </div>
    );
}
