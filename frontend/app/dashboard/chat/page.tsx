"use client";

import ChatBox from "@/components/ChatBox";
import { Sparkles, MessageSquare, ExternalLink } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="max-w-[1200px] mx-auto flex flex-col h-[calc(100vh-140px)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3 mb-1">
                        <h2 className="text-3xl font-extrabold tracking-tight text-white flex items-center">
                            AI Intelligence Studio
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-primary-500/10 text-primary-400 text-[10px] font-bold border border-primary-500/20 uppercase">
                            RAG Engine
                        </span>
                    </div>
                    <p className="text-slate-400 font-medium">
                        Consult your proprietary knowledge base with ultra-low latency.
                    </p>
                </div>
                <div className="flex items-center gap-3 self-end md:self-auto">
                    <div className="flex items-center space-x-2 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]"></div>
                        <span>Gemini 2.5 Flash</span>
                    </div>
                    <div className="h-4 w-px bg-slate-800 hidden md:block"></div>
                    <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <ExternalLink className="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <ChatBox />
            </div>
        </div>
    );
}

