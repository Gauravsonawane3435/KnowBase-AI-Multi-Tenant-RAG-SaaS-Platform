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

// Decode JWT payload (no verification — just read the expiry)
function isTokenExpired(token: string): boolean {
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (!payload.exp) return false;
        return Date.now() / 1000 > payload.exp;
    } catch {
        return true; // Malformed token = treat as expired
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const initAuth = () => {
            const token = getToken();
            if (token && checkAuth()) {
                if (isTokenExpired(token)) {
                    // Token expired — clear session silently
                    removeToken();
                    setUser(null);
                } else {
                    // Token looks valid
                    setUser({ email: "user@knowbase.ai" });
                }
            }
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = (token: string) => {
        localStorage.setItem("token", token);
        setUser({ email: "user@knowbase.ai" });
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
