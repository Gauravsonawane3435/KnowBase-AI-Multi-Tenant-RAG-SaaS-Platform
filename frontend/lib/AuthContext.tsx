"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken, isAuthenticated as checkAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: any;
    loading: boolean;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = async () => {
            if (checkAuth()) {
                // In a real app, you would fetch user profile here
                // For now we just set a dummy user
                setUser({ email: "user@example.com" });
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setUser({ email: "user@example.com" });
        router.push("/dashboard");
    };

    const logout = () => {
        removeToken();
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout,
                isAuthenticated: !!user,
            }}
        >
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
