"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Calendar,
    ArrowLeft,
    TrendingUp,
    Briefcase,
    Receipt,
    Loader2,
    ChevronRight,
    Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { format, parse } from "date-fns";

interface MonthlyHistory {
    month: string;
    sales: number;
    credits: number;
    expenses: number;
    salesCount: number;
    creditsCount: number;
    expensesCount: number;
}

export default function HistoryPage() {
    const router = useRouter();
    const [history, setHistory] = useState<MonthlyHistory[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHistory() {
            try {
                const res = await fetch("/api/salesboy/history");
                if (res.ok) {
                    const data = await res.json();
                    setHistory(data.history);
                }
            } catch (err) {
                console.error("Failed to fetch history", err);
            } finally {
                setLoading(false);
            }
        }
        fetchHistory();
    }, []);

    const formatMonth = (monthStr: string) => {
        const date = parse(monthStr, "yyyy-MM", new Date());
        return format(date, "MMMM yyyy");
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                <p className="text-slate-400 font-medium">Retrieving business archives...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white gap-2 pl-0"
                >
                    <ArrowLeft size={18} />
                    Back
                </Button>

                <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                    <Calendar size={18} className="text-emerald-500" />
                    <span className="text-white font-black uppercase text-xs tracking-widest">Performance Archive</span>
                </div>
            </div>

            <header>
                <h1 className="text-4xl font-black text-white tracking-tight uppercase italic">
                    All-Time <span className="text-emerald-500">History</span>
                </h1>
                <p className="text-slate-500 font-medium mt-2">Track your growth and operations month by month</p>
            </header>

            {history.length > 0 ? (
                <div className="space-y-6">
                    {history.map((item) => (
                        <Card key={item.month} className="glass-panel border-white/5 overflow-hidden transition-all hover:border-emerald-500/30">
                            <CardContent className="p-0">
                                <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
                                    <h2 className="text-lg font-black text-white uppercase tracking-tight">
                                        {formatMonth(item.month)}
                                    </h2>
                                    <div className="flex gap-2">
                                        <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">
                                            {item.salesCount + item.creditsCount + item.expensesCount} LOGS
                                        </span>
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-white/5">
                                    <div className="p-6 space-y-1">
                                        <div className="flex items-center gap-2 text-emerald-500 mb-2">
                                            <TrendingUp size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Total Sales</span>
                                        </div>
                                        <p className="text-2xl font-black text-white">₦{item.sales.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 font-medium">{item.salesCount} transactions</p>
                                    </div>
                                    <div className="p-6 space-y-1">
                                        <div className="flex items-center gap-2 text-blue-400 mb-2">
                                            <Briefcase size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Credit Issued</span>
                                        </div>
                                        <p className="text-2xl font-black text-white">₦{item.credits.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 font-medium">{item.creditsCount} supplies</p>
                                    </div>
                                    <div className="p-6 space-y-1">
                                        <div className="flex items-center gap-2 text-red-500 mb-2">
                                            <Receipt size={16} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Total Expenses</span>
                                        </div>
                                        <p className="text-2xl font-black text-white">₦{item.expenses.toLocaleString()}</p>
                                        <p className="text-xs text-slate-500 font-medium">{item.expensesCount} reports</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="p-20 rounded-3xl border border-dashed border-white/10 bg-white/2 text-center">
                    <div className="inline-flex p-4 rounded-full bg-white/5 mb-4">
                        <Search className="text-slate-600" size={32} />
                    </div>
                    <p className="text-slate-500 font-bold italic text-lg uppercase tracking-tight">No historical data found</p>
                    <p className="text-slate-600 text-sm mt-1">Start logging transactions to populate your history.</p>
                </div>
            )}
        </div>
    );
}
