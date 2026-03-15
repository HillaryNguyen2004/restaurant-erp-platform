"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { RegisterInput, RegisterSchema } from "../config/auth.config";

export function RegisterForm() {
    const router = useRouter();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<RegisterInput>({
        resolver: zodResolver(RegisterSchema),
        defaultValues: {
            email: "",
            password: "",
            confirmPassword: "",
            role: "customer",
        },
    });

    const onSubmit = (data: RegisterInput) => {
        toast.success("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        router.push("/auth/login");
    };

    return (
        <Card className="w-full max-w-lg mx-auto shadow-xl border-t-4 border-t-primary">
            <CardHeader className="space-y-1 text-center">
                <CardTitle className="text-2xl font-bold tracking-tight">Tạo tài khoản mới</CardTitle>
                <CardDescription>
                    Tham gia hệ thống quản lý nhà hàng thông minh ngay hôm nay
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                        <Field>
                            <FieldLabel>Xác nhận mật khẩu</FieldLabel>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                {...register("confirmPassword")}
                                data-invalid={!!errors.confirmPassword}
                            />
                            <FieldError errors={[errors.confirmPassword]} />
                        </Field>
                    </div>

                    <Field>
                        <FieldLabel>Vai trò</FieldLabel>
                        <Controller
                            name="role"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <SelectTrigger data-invalid={!!errors.role}>
                                        <SelectValue placeholder="Chọn vai trò của bạn" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="customer">Khách hàng</SelectItem>
                                        <SelectItem value="staff">Nhân viên phục vụ</SelectItem>
                                        <SelectItem value="chef">Đầu bếp</SelectItem>
                                        <SelectItem value="admin">Quản trị viên</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        <FieldError errors={[errors.role]} />
                    </Field>

                    <Button type="submit" className="w-full font-semibold shadow-md active:scale-95 transition-transform mt-2" size="lg">
                        Đăng ký
                    </Button>
                </form>
                <div className="mt-6 text-center text-sm">
                    Đã có tài khoản?{" "}
                    <Link href="/auth/login" className="font-medium text-primary hover:underline">
                        Đăng nhập
                    </Link>
                </div>
            </CardContent>
        </Card>
    );
}
