"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Role, useAuth } from "@/providers/auth-provider";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { LoginInput, LoginSchema } from "../config/auth.config";

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginInput>({
        resolver: zodResolver(LoginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const onSubmit = (data: LoginInput) => {
        // Mock login based on email prefix or just default to admin for demo
        let role: Role = "admin";
        if (data.email.includes("staff")) role = "staff";
        else if (data.email.includes("chef")) role = "chef";
        else if (data.email.includes("customer")) role = "customer";

        login(role);
        toast.success(`Đăng nhập thành công với vai trò ${role}`);

        // Redirect based on role
        if (role === "admin") router.push("/admin");
        else if (role === "chef") router.push("/chef");
        else if (role === "staff") router.push("/staff");
        else router.push("/customer");
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Chào mừng quay trở lại</CardTitle>
                <CardDescription>
                    Nhập thông tin của bạn để truy cập hệ thống
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            placeholder="admin@example.com"
                            {...register("email")}
                            data-invalid={!!errors.email}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Field>
                        <FieldLabel>Mật khẩu</FieldLabel>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            data-invalid={!!errors.password}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <div className="flex items-center justify-end">
                        <Link
                            href="/auth/forgot-password"
                            className="text-sm font-medium text-primary hover:underline"
                        >
                            Quên mật khẩu?
                        </Link>
                    </div>
                    <Button type="submit" className="w-full font-semibold shadow-md active:scale-95 transition-transform" size="lg">
                        Đăng nhập
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    Chưa có tài khoản?{" "}
                    <Link href="/auth/register" className="font-medium text-primary hover:underline">
                        Đăng ký ngay
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
