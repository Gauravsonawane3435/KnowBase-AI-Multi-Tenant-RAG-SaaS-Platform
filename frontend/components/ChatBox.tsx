"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { Send, User, Bot, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import ReactMarkdown from "react-markdown";

interface Message {
    role: "user" | "assistant";
    content: string;
}

export default function ChatBox() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setInput("");
        setMessages(prev => [...prev, { role: "user", content: userMessage }]);
        setLoading(true);

        try {
            const response = await api.post("/chat/ask", { query: userMessage });
            setMessages(prev => [...prev, { role: "assistant", content: response.data.response }]);
        } catch (err) {
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "Error: Failed to connect to the AI model. Ensure your backend is running."
            }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full glass rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800/50 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-b from-primary-500/5 to-transparent pointer-events-none"></div>

            {/* Chat header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800/50 bg-slate-50/50 dark:bg-slate-900/40 backdrop-blur-md relative z-10">
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <div className="h-3 w-3 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(14,165,233,0.8)] animate-pulse"></div>
                        <div className="absolute inset-0 h-3 w-3 rounded-full bg-primary-500 animate-ping opacity-20"></div>
                    </div>
                    <div>
                        <span className="text-sm font-bold text-slate-900 dark:text-white tracking-tight uppercase tracking-widest text-[10px]">Active Session</span>
                        <p className="text-xs text-slate-500 font-medium font-mono">ID: RAG-ENG-0922</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setMessages([])}
                        className="p-2.5 text-slate-500 hover:text-red-400 transition-all rounded-xl hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        title="Clear History"
                    >
                        <Trash2 className="h-4 w-4" />
                    </button>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-800 mx-1"></div>
                    <div className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
                        99.4% ACCURACY
                    </div>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 relative z-10">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-6 px-4"
                        >
                            <div className="relative">
                                <div className="absolute inset-x-0 inset-y-0 bg-primary-500 blur-3xl opacity-20 animate-pulse"></div>
                                <div className="relative rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl">
                                    <Bot className="h-12 w-12 text-primary-500" />
                                </div>
                            </div>
                            <div className="max-w-xs">
                                <p className="text-xl font-bold text-slate-900 dark:text-white">System Ready</p>
                                <p className="text-sm text-slate-500 mt-2 font-medium">I have indexed your knowledge base and am ready to answer any questions.</p>
                            </div>
                            <div className="grid grid-cols-1 gap-2 w-full max-w-sm">
                                <button onClick={() => setInput("What are the key points in my documents?")} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white hover:border-primary-500/50 transition-all text-left">
                                    "Summarize my recent uploads"
                                </button>
                                <button onClick={() => setInput("How does the multi-tenant architecture work?")} className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-white hover:border-primary-500/50 transition-all text-left">
                                    "Explain the system structure"
                                </button>
                            </div>
                        </motion.div>
                    ) : (
                        messages.map((m, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex max-w-[85%] gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                                    <div className={`flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl shadow-lg ${m.role === "user"
                                        ? "bg-primary-600 text-white shadow-primary-500/20"
                                        : "bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary-600 dark:text-primary-400"
                                        }`}>
                                        {m.role === "user" ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                    </div>
                                    <div className={`space-y-2 ${m.role === "user" ? "items-end" : "items-start"}`}>
                                        <div className={`rounded-2xl px-5 py-4 text-sm shadow-xl leading-relaxed ${m.role === "user"
                                            ? "bg-primary-600 text-white rounded-tr-none"
                                            : "bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 rounded-tl-none backdrop-blur-sm"
                                            }`}>
                                            {m.role === "assistant" ? (
                                                <div className="markdown-content">
                                                    <ReactMarkdown
                                                        components={{
                                                            strong: ({ node, ...props }) => <strong className="text-slate-900 dark:text-white font-extrabold" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                                            li: ({ node, ...props }) => <li className="mb-1" {...props} />
                                                        }}
                                                    >
                                                        {m.content}
                                                    </ReactMarkdown>
                                                </div>
                                            ) : (
                                                m.content
                                            )}
                                        </div>
                                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest px-1">
                                            {m.role === "user" ? "Authorized User" : "KnowBase AI Node"} • Just now
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-4">
                            <div className="flex-shrink-0 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary-500">
                                <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                            <div className="flex flex-col gap-2">
                                <div className="h-10 w-48 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 animate-pulse flex items-center px-4">
                                    <div className="flex gap-1">
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-bounce"></div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-bounce [animation-delay:0.2s]"></div>
                                        <div className="h-1.5 w-1.5 rounded-full bg-slate-200 dark:bg-slate-700 animate-bounce [animation-delay:0.4s]"></div>
                                    </div>
                                </div>
                                <span className="text-[9px] font-bold text-slate-600 uppercase tracking-tighter ml-1">Computing Neural Response...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-6 bg-white dark:bg-slate-950/50 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800/50 relative z-10">
                <form onSubmit={handleSend} className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-primary-500 to-purple-500 rounded-2xl opacity-20 group-focus-within:opacity-40 transition-opacity blur"></div>
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type your command or question..."
                            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 pl-6 pr-16 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all shadow-2xl"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || loading}
                            className="absolute right-2 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-600 text-white transition-all shadow-lg shadow-primary-500/30 hover:bg-primary-500 disabled:opacity-50 disabled:grayscale"
                        >
                            <Send className="h-5 w-5" />
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

}
