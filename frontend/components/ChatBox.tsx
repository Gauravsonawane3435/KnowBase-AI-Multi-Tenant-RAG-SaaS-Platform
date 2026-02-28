"use client";

import { useState, useEffect, useRef } from "react";
import api from "@/lib/api";
import { Send, User, Bot, Loader2, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
        <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-180px)] glass rounded-2xl shadow-lg border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Chat header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Live Knowledge Assistant</span>
                </div>
                <button
                    onClick={() => setMessages([])}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/10"
                    title="Clear Chat"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6">
                <AnimatePresence>
                    {messages.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center justify-center h-full text-center space-y-4 px-4"
                        >
                            <div className="rounded-full bg-primary-50 p-4 dark:bg-primary-900/10">
                                <Bot className="h-10 w-10 text-primary-500" />
                            </div>
                            <div>
                                <p className="text-lg font-medium text-slate-900 dark:text-white">Ask anything about your docs</p>
                                <p className="text-sm text-slate-500 max-w-[250px] mx-auto">I'll search through your knowledge base and provide cited answers.</p>
                            </div>
                        </motion.div>
                    ) : (
                        messages.map((m, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: m.role === "user" ? 10 : -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                            >
                                <div className={`flex max-w-[90%] md:max-w-[80%] space-x-2 md:space-x-3 ${m.role === "user" ? "flex-row-reverse space-x-reverse" : "flex-row"}`}>
                                    <div className={`flex-shrink-0 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg ${m.role === "user"
                                        ? "bg-primary-600 text-white"
                                        : "bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                                        }`}>
                                        {m.role === "user" ? <User className="h-4 w-4 md:h-5 md:w-5" /> : <Bot className="h-4 w-4 md:h-5 md:w-5" />}
                                    </div>
                                    <div className={`rounded-2xl px-3 py-2 md:px-4 md:py-3 text-sm shadow-sm ${m.role === "user"
                                        ? "bg-primary-600 text-white rounded-tr-none"
                                        : "bg-white border border-slate-200 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 rounded-tl-none"
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </AnimatePresence>
                {loading && (
                    <div className="flex justify-start">
                        <div className="flex space-x-2 md:space-x-3">
                            <div className="flex-shrink-0 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-400">
                                <Bot className="h-4 w-4 md:h-5 md:w-5" />
                            </div>
                            <div className="flex items-center space-x-2 rounded-2xl bg-white border border-slate-200 px-3 py-2 md:px-4 md:py-3 dark:bg-slate-800 dark:border-slate-700">
                                <Loader2 className="h-4 w-4 animate-spin text-primary-500" />
                                <span className="text-[10px] md:text-xs text-slate-500 font-medium whitespace-nowrap">Gemini is thinking...</span>
                            </div>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="p-3 md:p-4 border-t border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50">
                <form onSubmit={handleSend} className="relative flex items-center">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask a question..."
                        className="w-full rounded-xl border border-slate-300 bg-white py-3 md:py-4 pl-4 md:pl-6 pr-12 md:pr-14 text-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                    />
                    <button
                        type="submit"
                        disabled={!input.trim() || loading}
                        className="absolute right-1.5 md:right-2 flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg bg-primary-600 text-white transition-all hover:bg-primary-700 disabled:opacity-50"
                    >
                        <Send className="h-4 w-4 md:h-5 md:w-5" />
                    </button>
                </form>
                <p className="mt-2 text-[8px] md:text-[10px] text-center text-slate-400 uppercase tracking-widest font-bold">
                    KnowBase AI • Multi-Tenant Engine
                </p>
            </div>
        </div>
    );
}
