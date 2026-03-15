"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Role = "customer" | "staff" | "chef" | "admin";

interface User {
    id: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    login: (role: Role) => void;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Mock check session
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            setUser(JSON.parse(savedUser));
        }
        setIsLoading(false);
    }, []);

    const login = (role: Role) => {
        const mockUser: User = {
            id: "1",
            email: `${role}@example.com`,
            role,
        };
        setUser(mockUser);
        localStorage.setItem("user", JSON.stringify(mockUser));
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};
