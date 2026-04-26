"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { logout as logoutAction } from "@/app/actions/auth";

export type Role = "customer" | "staff" | "chef" | "admin";

interface User { id: string; role: Role; }
interface AuthContextType {
    user: User | null;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch("/api/auth/session")
            .then(r => r.json())
            .then(data => setUser(data?.user ?? null))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <AuthContext.Provider value={{ user, logout: logoutAction, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
};