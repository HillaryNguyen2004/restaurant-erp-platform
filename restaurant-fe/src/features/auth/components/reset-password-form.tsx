"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ResetPasswordInput, ResetPasswordSchema } from "../config/auth.config";

export function ResetPasswordForm() {
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordInput>({
        resolver: zodResolver(ResetPasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = (data: ResetPasswordInput) => {
        toast.success("Mật khẩu của bạn đã được cập nhật thành công!");
        router.push("/auth/login");
    };

    return (
        <Card className="w-full max-w-md mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Đặt lại mật khẩu</CardTitle>
                <CardDescription>
                    Vui lòng nhập mật khẩu mới cho tài khoản của bạn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <Field>
                        <FieldLabel>Mật khẩu mới</FieldLabel>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("password")}
                            data-invalid={!!errors.password}
                        />
                        <FieldError errors={[errors.password]} />
                    </Field>

                    <Field>
                        <FieldLabel>Xác nhận mật khẩu mới</FieldLabel>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            {...register("confirmPassword")}
                            data-invalid={!!errors.confirmPassword}
                        />
                        <FieldError errors={[errors.confirmPassword]} />
                    </Field>

                    <Button type="submit" className="w-full font-semibold shadow-md active:scale-95 transition-transform mt-2" size="lg">
                        Cập nhật mật khẩu
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
