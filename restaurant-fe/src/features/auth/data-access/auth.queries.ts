import { useMutation } from "@tanstack/react-query";
import { authApi } from "./auth.api";

export const useLogin = () => {
    return useMutation({
        mutationFn: authApi.login,
    });
};

export const useRegister = () => {
    return useMutation({
        mutationFn: authApi.register,
    });
};

export const useForgotPassword = () => {
    return useMutation({
        mutationFn: authApi.forgotPassword,
    });
};

export const useResetPassword = () => {
    return useMutation({
        mutationFn: authApi.resetPassword,
    });
};

export const useVerifyEmail = () => {
    return useMutation({
        mutationFn: authApi.verifyEmail,
    });
};
