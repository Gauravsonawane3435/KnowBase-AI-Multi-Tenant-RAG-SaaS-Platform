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
    BarChart3,
    X
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { useUI } from "@/lib/UIContext";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Database, label: "Documents", href: "/dashboard/upload" },
    { icon: MessageSquare, label: "AI Chat", href: "/dashboard/chat" },
    { icon: UploadCloud, label: "Knowledge Graph", href: "/dashboard/graph" },
    { icon: BarChart3, label: "Analytics", href: "/dashboard/analytics" },
];

export default function Sidebar() {
    const pathname = usePathname();
    const { sidebarOpen, setSidebarOpen } = useUI();

    const SidebarContent = (
        <div className="flex flex-col h-full bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-900">
            <div className="flex h-20 items-center px-6 mb-4">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary-600 shadow-lg shadow-primary-500/20">
                        <Database className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <span className="block text-lg font-bold text-slate-900 dark:text-white tracking-tight">KnowBase AI</span>
                        <span className="block text-[10px] text-slate-500 font-medium tracking-widest uppercase">v2.0.1</span>
                    </div>
                </div>
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden ml-auto p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>

            <nav className="flex-1 space-y-2 px-4">
                {menuItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setSidebarOpen(false)}
                            className={cn(
                                "group flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                                isActive
                                    ? "sidebar-link-active"
                                    : "text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
                            )}
                        >
                            <item.icon className={cn(
                                "mr-3 h-5 w-5 transition-colors",
                                isActive ? "text-primary-400" : "text-slate-600 group-hover:text-slate-400"
                            )} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 mt-auto">
                <Link
                    href="/dashboard"
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                >
                    <Settings className="mr-3 h-5 w-5 text-slate-600" />
                    Settings
                </Link>
                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-900 flex items-center justify-between px-2">
                    <button className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2 hover:text-slate-400 transition-colors">
                        <ChevronRight className="h-3 w-3 rotate-180" /> Collapse
                    </button>
                </div>
            </div>
        </div>
    );


    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="sticky top-0 h-screen w-64 hidden md:flex flex-col">
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
