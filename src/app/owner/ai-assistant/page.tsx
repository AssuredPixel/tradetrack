"use client";

import { useState, useRef, useEffect } from "react";
import { 
    Bot, Send, Loader2, User, Sparkles, 
    MessageSquare, TrendingUp, DollarSign, 
    PackageOpen, RefreshCcw 
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Message {
    role: "user" | "ai";
    content: string;
}

const SUGGESTED_QUESTIONS = [
    "What was my total profit this year?",
    "How much did I spend on expenses last month?",
    "Show me my recent sales breakdown.",
    "What is my current outstanding credit?",
    "Analyze my business performance YTD."
];

export default function AIAssistant() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (text: string) => {
        if (!text.trim() || isLoading) return;

        const userMessage: Message = { role: "user", content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            const response = await fetch("/api/owner/ai-assistant", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt: text }),
            });

            const data = await response.json();

            if (data.error) throw new Error(data.error);

            const aiMessage: Message = { role: "ai", content: data.response };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error: any) {
            console.error("AI Error:", error);
            const errorMessage: Message = { role: "ai", content: "Sorry, I encountered an error. Please try again later." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-[1000px] mx-auto h-[calc(100vh-180px)] flex flex-col space-y-6 pb-8">
            {/* Header */}
            <header className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                        <Bot className="w-6 h-6 text-indigo-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                            Enterprise <span className="text-indigo-500">AI Assistant</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Real-time business intelligence & forecasting</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Grounded in Real Data
                    </span>
                </div>
            </header>

            {/* Chat Container */}
            <div className="flex-1 glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col relative">
                {messages.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-8 z-0">
                        <div className="w-20 h-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center border border-indigo-500/20 animate-bounce">
                            <Sparkles className="w-10 h-10 text-indigo-500" />
                        </div>
                        <div className="max-w-md">
                            <h2 className="text-2xl font-black text-white mb-2">How can I help you today?</h2>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                I have access to your sales, purchases, expenses and all financial records. 
                                Type a question below to get instant insights.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                            {SUGGESTED_QUESTIONS.map((q, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSendMessage(q)}
                                    className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-indigo-500/30 hover:bg-white/10 transition-all text-left group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MessageSquare className="w-4 h-4 text-slate-500 group-hover:text-indigo-500" />
                                        <span className="text-sm text-slate-300 group-hover:text-white font-medium">{q}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Messages List */}
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10"
                >
                    {messages.map((msg, idx) => (
                        <div 
                            key={idx} 
                            className={`flex gap-4 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                        >
                            <div className={`w-8 h-8 rounded-lg shrink-0 flex items-center justify-center border ${
                                msg.role === "user" 
                                ? "bg-white/5 border-white/10" 
                                : "bg-indigo-500/10 border-indigo-500/20"
                            }`}>
                                {msg.role === "user" ? <User size={16} className="text-slate-400" /> : <Bot size={16} className="text-indigo-500" />}
                            </div>
                            <div className={`max-w-[80%] rounded-2xl p-4 text-sm leading-relaxed ${
                                msg.role === "user"
                                ? "bg-indigo-600 text-white shadow-lg"
                                : "bg-white/5 text-slate-200 border border-white/5"
                            }`}>
                                <div className="prose prose-invert prose-sm max-w-none whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex gap-4">
                            <div className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20">
                                <Bot size={16} className="text-indigo-500" />
                            </div>
                            <div className="bg-white/5 text-slate-400 border border-white/5 rounded-2xl p-4 flex items-center gap-3">
                                <Loader2 size={16} className="animate-spin text-indigo-500" />
                                <span className="font-medium animate-pulse">Analyzing real-time business data...</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 border-t border-white/5 bg-black/40 backdrop-blur-xl">
                    <form 
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSendMessage(input);
                        }}
                        className="relative flex items-center"
                    >
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a business question (e.g., 'What was my profit last month?')"
                            disabled={isLoading}
                            className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-6 pr-14 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="absolute right-3 p-2 rounded-lg bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-50 disabled:bg-slate-700 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.3)]"
                        >
                            <Send size={20} />
                        </button>
                    </form>
                    <p className="mt-3 text-[10px] text-center text-slate-500 font-medium uppercase tracking-widest">
                        AI provides reports based on verified ledger entries only
                    </p>
                </div>
            </div>
        </div>
    );
}
