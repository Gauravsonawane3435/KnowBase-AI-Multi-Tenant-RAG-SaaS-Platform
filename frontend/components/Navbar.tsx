"use client";

import { LogOut, User, Bell, Sun, Moon, Menu, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useUI } from "@/lib/UIContext";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export default function Navbar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toggleSidebar } = useUI();

    return (
        <header className="sticky top-0 z-10 flex h-20 items-center justify-between border-b border-slate-200 dark:border-slate-900 bg-white/80 dark:bg-slate-950/80 px-6 backdrop-blur-xl">
            <div className="flex items-center gap-x-4">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-500 hover:bg-slate-900 rounded-xl md:hidden transition-colors"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="hidden md:flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-widest">
                    <ShieldCheck className="h-4 w-4 text-primary-500" />
                    Security Verified Session
                </div>
            </div>

            <div className="flex items-center gap-x-2 md:gap-x-4">
                <div className="flex items-center bg-slate-100 dark:bg-slate-900 rounded-xl p-1 border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "rounded-lg p-2 transition-all duration-200",
                            theme === "light" ? "bg-white text-slate-900 shadow-lg" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Sun className="h-4 w-4" />
                    </button>
                    <button
                        onClick={toggleTheme}
                        className={cn(
                            "rounded-lg p-2 transition-all duration-200",
                            theme === "dark" ? "bg-primary-600 text-white shadow-lg shadow-primary-500/20" : "text-slate-500 hover:text-slate-300"
                        )}
                    >
                        <Moon className="h-4 w-4" />
                    </button>
                </div>

                <button className="rounded-xl p-2.5 text-slate-500 hover:bg-slate-900 hover:text-white transition-all border border-transparent hover:border-slate-800">
                    <Bell className="h-5 w-5" />
                </button>

                <div className="h-8 w-px bg-slate-800/50 hidden sm:block mx-1"></div>

                <div className="flex items-center gap-x-4">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admin User</p>
                        <p className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">Enterprise Plan</p>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20 border border-primary-400/20">
                        <User className="h-6 w-6" />
                    </div>
                    <button
                        onClick={logout}
                        className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/20"
                        title="Logout"
                    >
                        <LogOut className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </header>
    );
}

