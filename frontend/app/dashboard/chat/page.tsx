"use client";

import ChatBox from "@/components/ChatBox";
import { Sparkles, MessageSquare } from "lucide-react";

export default function ChatPage() {
    return (
        <div className="flex flex-col h-[calc(100vh-140px)] space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center">
                        Chat AI <Sparkles className="ml-2 h-6 w-6 text-primary-500 fill-primary-500/20" />
                    </h2>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Ask questions about your uploaded documents using Retrieval Augmented Generation.
                    </p>
                </div>
                <div className="hidden sm:flex items-center space-x-2 text-xs font-medium text-slate-500">
                    <MessageSquare className="h-4 w-4" />
                    <span>Using Gemini 2.5 Flash</span>
                </div>
            </div>

            <ChatBox />
        </div>
    );
}
