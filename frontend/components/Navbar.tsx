"use client";

import { LogOut, User, Bell, Sun, Moon, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import { useTheme } from "@/lib/ThemeContext";
import { useUI } from "@/lib/UIContext";

export default function Navbar() {
    const { logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const { toggleSidebar } = useUI();

    return (
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-slate-200 bg-white/80 px-4 md:px-6 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/80">
            <div className="flex items-center gap-x-3">
                <button
                    onClick={toggleSidebar}
                    className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg md:hidden"
                >
                    <Menu className="h-6 w-6" />
                </button>
                <div className="flex items-center md:hidden">
                    <span className="text-xl font-bold text-primary-600">KB AI</span>
                </div>
                <div className="hidden md:block">
                    <h1 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Workspace</h1>
                </div>
            </div>

            <div className="flex items-center gap-x-2 md:gap-x-4">
                <button
                    onClick={toggleTheme}
                    className="rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                >
                    {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </button>

                <button className="hidden sm:block rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200">
                    <Bell className="h-5 w-5" />
                </button>

                <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

                <div className="flex items-center gap-x-2 md:gap-x-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                        <User className="h-5 w-5" />
                    </div>
                    <button
                        onClick={logout}
                        className="flex items-center text-sm font-medium text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400"
                    >
                        <LogOut className="md:mr-2 h-4 w-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>
            </div>
        </header>
    );
}
