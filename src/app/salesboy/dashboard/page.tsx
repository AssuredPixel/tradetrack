"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    ShoppingCart,
    Briefcase,
    Receipt,
    ChevronRight,
    TrendingUp,
    Hash,
    Wallet,
    Calendar
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface Stats {
    totalSalesAmount: number;
    transactionCount: number;
    totalExpenses: number;
}

export default function SalesBoyDashboard() {
    const [stats, setStats] = useState<Stats>({
        totalSalesAmount: 0,
        transactionCount: 0,
        totalExpenses: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/salesboy/stats/today");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const todayDate = format(new Date(), "EEEE, do MMMM yyyy");

    return (
        <div className="max-w-7xl mx-auto space-y-12">
            {/* Today's Date Display */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-widest uppercase text-xs">
                    <Calendar size={14} />
                    <span>Live Operations</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {todayDate}
                </h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel border-white/5 bg-emerald-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
                                <TrendingUp size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">TODAY</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Sales</p>
                        <h3 className="text-3xl font-black text-white">
                            ₦{loading ? "---" : stats.totalSalesAmount.toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 bg-blue-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
                                <Hash size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">COUNT</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Transactions</p>
                        <h3 className="text-3xl font-black text-white">
                            {loading ? "---" : stats.transactionCount}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 bg-red-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 group-hover:scale-110 transition-transform">
                                <Wallet size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-red-500/10 text-red-500 px-2 py-1 rounded">CASH OUT</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Total Expenses</p>
                        <h3 className="text-3xl font-black text-white">
                            ₦{loading ? "---" : stats.totalExpenses.toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions (Large Buttons) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Link href="/salesboy/log-sale" className="block">
                    <button className="w-full h-24 lg:h-32 bg-emerald-500 text-[#070b14] rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-emerald-400 transition-all duration-300 shadow-xl shadow-emerald-500/5 hover:-translate-y-1">
                        <div className="bg-white/20 p-2 rounded-lg">
                            <ShoppingCart size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider">Log a Sale</span>
                    </button>
                </Link>

                <Link href="/salesboy/log-credit" className="block">
                    <button className="w-full h-24 lg:h-32 bg-white/5 border border-white/10 text-white rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="bg-white/5 p-2 rounded-lg">
                            <Briefcase size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider">Log Credit</span>
                    </button>
                </Link>

                <Link href="/salesboy/log-expense" className="block">
                    <button className="w-full h-24 lg:h-32 bg-white/5 border border-white/10 text-white rounded-2xl flex flex-col items-center justify-center gap-2 group hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
                        <div className="bg-red-500/10 p-2 rounded-lg">
                            <Receipt size={24} />
                        </div>
                        <span className="text-sm font-black uppercase tracking-wider text-red-400">Log Expense</span>
                    </button>
                </Link>
            </div>

            {/* Bottom Link */}
            <div className="flex justify-center pt-4">
                <Link
                    href="/salesboy/today"
                    className="text-slate-400 hover:text-emerald-500 font-bold uppercase tracking-[0.2em] text-xs transition-colors border-b border-transparent hover:border-emerald-500 pb-1"
                >
                    View today&apos;s entries
                </Link>
            </div>
        </div>
    );
}
