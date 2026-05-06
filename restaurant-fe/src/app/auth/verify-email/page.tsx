"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function VerifyEmailPage() {
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    useEffect(() => {
        if (token) {
            // Mock verification delay
            const timer = setTimeout(() => {
                setStatus("success");
            }, 2000);
            return () => clearTimeout(timer);
        } else {
            setStatus("error");
        }
    }, [token]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50/50 dark:bg-slate-950 px-4">
            <div className="absolute inset-0 bg-grid-slate-200 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-800/25 -z-10" />

            <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">Xác thực Email</CardTitle>
                    <CardDescription>
                        {status === "loading" && "Đang xác thực tài khoản của bạn..."}
                        {status === "success" && "Tài khoản đã được xác thực thành công!"}
                        {status === "error" && "Liên kết xác thực không hợp lệ hoặc đã hết hạn."}
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                    {status === "loading" && <Loader2 className="w-16 h-16 text-primary animate-spin" />}
                    {status === "success" && <CheckCircle2 className="w-16 h-16 text-green-500" />}
                    {status === "error" && <XCircle className="w-16 h-16 text-destructive" />}

                    <div className="mt-8 w-full">
                        {status !== "loading" && (
                            <Button asChild className="w-full">
                                <Link href="/auth/login">Đi đến Đăng nhập</Link>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
