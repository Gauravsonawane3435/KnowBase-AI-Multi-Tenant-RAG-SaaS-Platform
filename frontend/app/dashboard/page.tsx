"use client";

import { useEffect, useState } from "react";
import { FileText, MessageSquare, Users, BarChart3, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";

export default function DashboardPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState([
        { name: "Total Documents", value: "0", icon: FileText },
        { name: "Total Chats", value: "0", icon: MessageSquare },
        { name: "Knowledge Bits", value: "0", icon: BarChart3 },
        { name: "Active Sessions", value: "1", icon: Users },
    ]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            // Only fetch if authenticated and auth state is finished loading
            if (authLoading || !isAuthenticated) return;

            try {
                const response = await api.get("/dashboard/stats");
                const data = response.data;
                setStats([
                    { name: "Total Documents", value: data.documents.toString(), icon: FileText },
                    { name: "Total Chats", value: data.chats.toString(), icon: MessageSquare },
                    { name: "Knowledge Bits", value: data.knowledge_bits.toString(), icon: BarChart3 },
                    { name: "Active Sessions", value: data.sessions.toString(), icon: Users },
                ]);
            } catch (error) {
                console.error("Failed to fetch dashboard stats", error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [isAuthenticated, authLoading]);

    if (authLoading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Welcome back</h2>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                    Monitor your multi-tenant RAG platform performance and knowledge base status.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                    <div key={stat.name} className="glass rounded-xl p-6 shadow-sm relative overflow-hidden group">
                        <div className="flex items-center">
                            <div className="rounded-lg bg-primary-100 p-3 text-primary-700 dark:bg-primary-900/20 dark:text-primary-400">
                                <stat.icon className="h-6 w-6" />
                            </div>
                            <div className="ml-5">
                                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</p>
                                {loading ? (
                                    <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                                ) : (
                                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white transition-all group-hover:scale-110 origin-left">
                                        {stat.value}
                                    </h3>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                <div className="glass rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                    <div className="mt-6 flex flex-col items-center justify-center py-10 text-center">
                        <div className="rounded-full bg-slate-100 p-4 dark:bg-slate-800">
                            <FileText className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="mt-4 text-sm text-slate-500">No recent activity found. Start by uploading a document.</p>
                    </div>
                </div>

                <div className="glass rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">System Status</h3>
                    <div className="mt-6 space-y-4">
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm text-slate-600 dark:text-slate-400">FastAPI Backend</span>
                            <span className="flex items-center text-xs font-medium text-green-600">
                                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                                Connected
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-sm text-slate-600 dark:text-slate-400">PostgreSQL Vector</span>
                            <span className="flex items-center text-xs font-medium text-green-600">
                                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                                Active
                            </span>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Gemini LLM API</span>
                            <span className="flex items-center text-xs font-medium text-green-600">
                                <div className="mr-2 h-2 w-2 rounded-full bg-green-500"></div>
                                Operational
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
