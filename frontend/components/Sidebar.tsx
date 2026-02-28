"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    UploadCloud,
    MessageSquare,
    Settings,
    ChevronRight,
    Database,
    X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useUI } from "@/lib/UIContext";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/dashboard" },
    { icon: UploadCloud, label: "Upload", href: "/dashboard/upload" },
    { icon: MessageSquare, label: "Chat AI", href: "/dashboard/chat" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen } = useUI();

    const SidebarContent = (
        <>
            <div className="flex h-16 items-center justify-between px-6">
                <div className="flex items-center">
                    <Database className="h-8 w-8 text-primary-600" />
                    <span className="ml-3 text-xl font-bold text-slate-900 dark:text-white">KnowBase AI</span>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="mt-6 flex-1 space-y-1 px-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                                "group flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-colors",
                                isActive
                                    ? "bg-primary-50 text-primary-600 dark:bg-primary-900/10 dark:text-primary-400"
                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                            )}
                        >
                            <item.icon className={cn(
                                "mr-3 h-5 w-5",
                                isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 group-hover:text-slate-500 dark:text-slate-500 dark:group-hover:text-slate-300"
                            )} />
                            {item.label}
                            {isActive && (
                                <ChevronRight className="ml-auto h-4 w-4 text-primary-600 dark:text-primary-400" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-200 p-4 dark:border-slate-800">
                <Link
                    href="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white"
                >
                    <Settings className="mr-3 h-5 w-5 text-slate-400" />
                    Settings
                </Link>
            </div>
        </>
    );

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sticky top-0 h-screen w-64 border-r border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 hidden md:flex flex-col">
                {SidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <div
                className={cn(
                    "fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity md:hidden",
                    sidebarOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={() => setSidebarOpen(false)}
            />

            {/* Mobile Sidebar Drawer */}
            <aside
                className={cn(
                    "fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out md:hidden flex flex-col",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                {SidebarContent}
            </aside>
        </>
    );
}
