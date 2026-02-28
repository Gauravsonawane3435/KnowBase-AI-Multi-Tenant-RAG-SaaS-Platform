"use client";

import { useEffect, useState } from "react";
import {
    FileText,
    MessageSquare,
    Users,
    BarChart3,
    Loader2,
    Sparkles,
    Upload,
    Plus,
    TrendingUp,
    ShieldCheck,
    Cpu,
    Zap,
    ExternalLink,
    RefreshCw,
    Activity,
    Database,
    ZapOff
} from "lucide-react";
import api from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, trend, color, loading }: any) => (
    <div className="glass-card group relative overflow-hidden">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon className={`h-6 w-6 ${color.replace('bg-', 'text-')}`} />
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-full border border-green-400/20">
                <TrendingUp className="h-3 w-3" /> {trend}
            </div>
        </div>
        <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
            {loading ? (
                <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 animate-pulse rounded-lg" />
            ) : (
                <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            )}
        </div>
        {/* Simple Sparkline Placeholder */}
        <div className="mt-6 h-12 w-full relative">
            <svg className="w-full h-full" viewBox="0 0 100 40" preserveAspectRatio="none">
                <path
                    d="M0 35 Q 25 35, 35 25 T 60 15 T 85 25 T 100 10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className={`${color.replace('bg-', 'text-')} opacity-40`}
                />
                <path
                    d="M0 35 Q 25 35, 35 25 T 60 15 T 85 25 T 100 10 V 40 H 0 Z"
                    fill="url(#gradient)"
                    className={`${color.replace('bg-', 'text-')} opacity-10`}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="currentColor" stopOpacity="0.5" />
                        <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                </defs>
            </svg>
        </div>
    </div>
);

const MetricCard = ({ label, value, icon: Icon, color }: any) => (
    <div className="glass rounded-xl p-4 flex items-center gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
        <div className={`p-2 rounded-lg ${color} bg-opacity-20 text-slate-900 dark:text-white`}>
            <Icon className="h-4 w-4" />
        </div>
        <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">{value}</p>
        </div>
        <div className="ml-auto w-16 h-8 opacity-30">
            <svg className="w-full h-full" viewBox="0 0 40 20" preserveAspectRatio="none">
                <path d="M0 15 L 10 10 L 20 18 L 30 5 L 40 12" fill="none" stroke="currentColor" strokeWidth="1" className={color.replace('bg-', 'text-')} />
            </svg>
        </div>
    </div>
);

export default function DashboardPage() {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            if (authLoading || !isAuthenticated) return;
            try {
                const response = await api.get("/dashboard/stats");
                setStats(response.data);
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
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCw className="h-10 w-10 animate-spin text-primary-500" />
                    <p className="text-slate-400 font-medium animate-pulse">Initializing Command Center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1600px] mx-auto space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                            <Sparkles className="h-8 w-8 text-primary-500" />
                            KnowBase AI Command Center
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-green-500/10 text-green-600 dark:text-green-400 text-[10px] font-bold border border-green-500/20 uppercase animate-pulse">
                            ● Live
                        </span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-lg">
                        Real-time insights into your multi-tenant RAG intelligence system.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-600 text-white font-bold text-sm hover:bg-primary-500 transition-all shadow-lg shadow-primary-500/20">
                        <Upload className="h-4 w-4" /> Upload Document
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                        <Plus className="h-4 w-4" /> New Chat
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 text-slate-600 dark:text-slate-300 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
                        <BarChart3 className="h-4 w-4" /> View Analytics
                    </button>
                    <div className="h-10 w-px bg-slate-200 dark:bg-slate-800/50 mx-2 hidden sm:block"></div>
                    <select className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-primary-500/50 cursor-pointer shadow-sm">
                        <option>Production Workspace</option>
                        <option>Development</option>
                        <option>Staging</option>
                    </select>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Documents"
                    value={stats?.documents || "0"}
                    icon={FileText}
                    trend="12.5%"
                    color="bg-primary-500"
                    loading={loading}
                />
                <StatCard
                    title="Total Chats"
                    value={stats?.chats || "0"}
                    icon={MessageSquare}
                    trend="8.2%"
                    color="bg-purple-500"
                    loading={loading}
                />
                <StatCard
                    title="Knowledge Chunks"
                    value={stats?.knowledge_bits ? (stats.knowledge_bits > 1000 ? (stats.knowledge_bits / 1000).toFixed(1) + 'K' : stats.knowledge_bits) : "0"}
                    icon={Database}
                    trend="15.7%"
                    color="bg-blue-500"
                    loading={loading}
                />
                <StatCard
                    title="Active Sessions"
                    value={stats?.sessions || "1"}
                    icon={Users}
                    trend="4.2%"
                    color="bg-indigo-500"
                    loading={loading}
                />
            </div>

            {/* Performance Metrics Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" /> AI Performance Metrics
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    <MetricCard label="Avg Retrieval Time" value="87 ms" icon={Clock} color="bg-cyan-500" />
                    <MetricCard label="Embedding Latency" value="142 ms" icon={Cpu} color="bg-emerald-500" />
                    <MetricCard label="LLM Response Time" value="1.2 s" icon={Activity} color="bg-rose-500" />
                    <MetricCard label="Hybrid Search Score" value="0.94" icon={Zap} color="bg-amber-500" />
                    <MetricCard label="Tokens Usage" value="847K" icon={Sparkles} color="bg-primary-500" />
                </div>
            </div>

            {/* Lower Section: Activity & Infrastructure */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Activity Feed */}
                <div className="lg:col-span-2 glass-card">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Live Activity Feed</h3>
                        <span className="text-xs text-slate-500 font-medium tracking-tight">Real-time updates</span>
                    </div>

                    {/* Activity Items */}
                    {[
                        { icon: Upload, title: "Document Uploaded", desc: "User B uploaded annual_revenue_2024.pdf", time: "2 min ago", color: "text-blue-600 dark:text-blue-400" },
                        { icon: Cpu, title: "Chunks Generated", desc: "42 chunks generated from annual_revenue_2024.pdf", time: "3 min ago", color: "text-amber-600 dark:text-amber-400" },
                        { icon: Sparkles, title: "Embeddings Created", desc: "Vector embeddings successfully indexed in PgVector", time: "4 min ago", color: "text-emerald-600 dark:text-emerald-400" }
                    ].map((item, i) => (
                        <div key={i} className="flex items-start gap-4 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-800">
                            <div className={`p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${item.color}`}>
                                <item.icon className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{item.title}</h4>
                                <p className="text-xs text-slate-500 mt-1">{item.desc}</p>
                            </div>
                            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-600 uppercase mt-1">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Infrastructure Status */}
            <div className="glass-card">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">Infrastructure Status</h3>
                    <RefreshCw className="h-4 w-4 text-slate-500 hover:text-primary-500 cursor-pointer transition-colors" />
                </div>

                <div className="space-y-6">
                    {[
                        { name: "FastAPI Backend", status: "Operational", latency: "39ms", health: "99.2%" },
                        { name: "PostgreSQL Vector DB", status: "Operational", latency: "14ms", health: "98.7%" },
                        { name: "Gemini LLM API", status: "Operational", latency: "235ms", health: "97.4%" }
                    ].map((service, i) => (
                        <div key={i} className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800/50 space-y-4 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-sm font-bold text-slate-900 dark:text-white">{service.name}</span>
                                </div>
                                <span className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">{service.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-transparent rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Latency</p>
                                    <p className="text-sm font-bold text-slate-900 dark:text-white">{service.latency}</p>
                                </div>
                                <div className="bg-slate-100 dark:bg-slate-950/50 border border-slate-200 dark:border-transparent rounded-lg p-2 text-center">
                                    <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Health</p>
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-800 rounded-full max-w-[40px]">
                                            <div className="h-full bg-green-500 rounded-full" style={{ width: service.health }}></div>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{service.health}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// Dummy Clock component for metrics
function Clock(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    )
}

