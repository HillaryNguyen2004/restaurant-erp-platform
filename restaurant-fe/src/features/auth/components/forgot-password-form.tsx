"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ForgotPasswordInput, ForgotPasswordSchema } from "../config/auth.config";
import { useForgotPassword } from "../data-access/auth.queries";

export function ForgotPasswordForm() {
    const forgotPasswordMutation = useForgotPassword();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordInput>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (data: ForgotPasswordInput) => {
        try {
            await forgotPasswordMutation.mutateAsync(data.email);
            toast.success("Yêu cầu đặt lại mật khẩu đã được gửi đến email của bạn.");
        } catch (error) {
            toast.error("Gửi yêu cầu thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Quên mật khẩu?</CardTitle>
                <CardDescription>
                    Nhập email của bạn và chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel>Email</FieldLabel>
                        <Input
                            placeholder="name@example.com"
                            {...register("email")}
                            data-invalid={!!errors.email}
                        />
                        <FieldError errors={[errors.email]} />
                    </Field>
                    <Button 
                        type="submit" 
                        className="w-full font-semibold shadow-md active:scale-95 transition-transform" 
                        size="lg"
                        disabled={forgotPasswordMutation.isPending}
                    >
                        {forgotPasswordMutation.isPending ? "Đang xử lý..." : "Gửi yêu cầu"}
                    </Button>
                </form>
                <div className="mt-6 text-center">
                    <Link href="/auth/login" className="text-sm font-medium text-muted-foreground hover:text-primary inline-flex items-center gap-1">
                        <ChevronLeft className="w-4 h-4" /> Quay lại đăng nhập
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
