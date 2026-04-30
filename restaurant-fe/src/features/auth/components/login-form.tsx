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
import { useLogin } from "../data-access/auth.queries";

export function LoginForm() {
    const { login } = useAuth();
    const router = useRouter();
    const loginMutation = useLogin();

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

    const onSubmit = async (data: LoginInput) => {
        try {
            const result = await loginMutation.mutateAsync(data);
            
            // Assuming result contains token and user info
            // For now, if result is empty (placeholder), we mock it like before but with real role if possible
            const token = result?.accessToken || "mock-token";
            const user = result?.user || { 
                id: "1", 
                role: data.email.includes("staff") ? "staff" : 
                      data.email.includes("chef") ? "chef" : 
                      data.email.includes("customer") ? "customer" : "admin" 
            };

            login(token, user);
            toast.success(`Đăng nhập thành công!`);

            // Redirect based on role
            router.push(`/${user.role}`);
        } catch (error) {
            toast.error("Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
        }
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
                        <FieldLabel htmlFor="email">Email</FieldLabel>
                        <Input
                            id="email"
                            placeholder="admin@example.com"
                            {...register("email")}
                            data-invalid={!!errors.email}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>

                    <Field>
                        <FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
                        <Input
                            id="password"
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
                    <Button 
                        type="submit" 
                        className="w-full font-semibold shadow-md active:scale-95 transition-transform" 
                        size="lg"
                        disabled={loginMutation.isPending}
                    >
                        {loginMutation.isPending ? "Đang xử lý..." : "Đăng nhập"}
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
