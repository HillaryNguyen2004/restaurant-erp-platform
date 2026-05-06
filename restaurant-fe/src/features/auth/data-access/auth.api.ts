import { API_CONFIG } from "@/config/api.config";
import { fetchWithToken } from "@/lib/fetch-with-token";
import { LoginInput, RegisterInput, ResetPasswordInput, ForgotPasswordInput } from "../config/auth.config";

const mockAuthApi = {
    login: async (data: LoginInput) => {
        console.log("Mock Login:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return {
            accessToken: "mock-jwt-token",
            user: {
                id: "u1",
                email: data.email,
                role: data.email.includes("admin") ? "admin" : 
                      data.email.includes("chef") ? "chef" : 
                      data.email.includes("staff") ? "staff" : "customer"
            }
        };
    },
    register: async (data: RegisterInput) => {
        console.log("Mock Register:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
    forgotPassword: async (data: ForgotPasswordInput) => {
        console.log("Mock Forgot Password:", data.email);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
    resetPassword: async (data: ResetPasswordInput) => {
        console.log("Mock Reset Password:", data);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
    verifyEmail: async (token: string) => {
        console.log("Mock Verify Email:", token);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { success: true };
    },
};

const realAuthApi = {
    login: async (data: LoginInput) => {
        return fetchWithToken(`${API_CONFIG.USER_MANAGEMENT}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    register: async (data: RegisterInput) => {
        return fetchWithToken(`${API_CONFIG.USER_MANAGEMENT}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    forgotPassword: async (data: ForgotPasswordInput) => {
        return fetchWithToken(`${API_CONFIG.USER_MANAGEMENT}/auth/forgot-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    resetPassword: async (data: ResetPasswordInput) => {
        return fetchWithToken(`${API_CONFIG.USER_MANAGEMENT}/auth/reset-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
        });
    },
    verifyEmail: async (token: string) => {
        return fetchWithToken(`${API_CONFIG.USER_MANAGEMENT}/auth/verify-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
        });
    },
};

export const authApi = API_CONFIG.USE_MOCK ? mockAuthApi : realAuthApi;
