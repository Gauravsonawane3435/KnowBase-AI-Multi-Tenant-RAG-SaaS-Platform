"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import Sidebar from "@/components/Sidebar";
import Navbar from "@/components/Navbar";
import { motion } from "framer-motion";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <ProtectedRoute>
            <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950">
                <Sidebar />
                <div className="flex flex-1 flex-col transition-all duration-300">
                    <Navbar />
                    <motion.main
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="flex-1 p-6 md:p-8"
                    >
                        {children}
                    </motion.main>
                </div>
            </div>
        </ProtectedRoute>
    );
}
