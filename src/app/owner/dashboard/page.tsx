"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Briefcase, Loader2, TrendingUp, TrendingDown,
    ArrowRight, DollarSign, PackageOpen, CreditCard,
    Landmark, Wallet, Activity, ShoppingCart,
    Sparkles
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";

interface ActivityItem {
    id: string;
    type: string;
    submittedBy: string;
    amount: number;
    description?: string;
    submittedAt: string;
}

interface DashboardStats {
    startingCapital: number;
    totalCapitalDeployed: number;
    totalSalesRevenue: number;
    totalCOGS: number;
    totalExpenses: number;
    netProfitOrLoss: number;
    outstandingCredit: number;
    totalCreditCollectedYTD: number;
    totalBankLodgmentsYTD: number;
}

export default function OwnerDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [activities, setActivities] = useState<ActivityItem[]>([]);
    const currentYear = new Date().getFullYear();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // First verify foundation exists
                const capRes = await fetch(`/api/owner/starting-capital?year=${currentYear}`);
                const capData = await capRes.json();

                if (!capData.capital) {
                    // Temporarily relaxed for development
                    // router.push("/owner/starting-capital?redirected=true");
                    // return;
                }

                // If exists, fetch the massive stats payload
                const statsRes = await fetch(`/api/owner/dashboard-stats?year=${currentYear}`);
                const statsData = await statsRes.json();

                if (statsData.metrics) {
                    setStats(statsData.metrics);
                }
                if (statsData.recentActivity) {
                    setActivities(statsData.recentActivity);
                }
            } catch (error) {
                console.error("Error loading dashboard:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();

        // Establish Server-Sent Events (SSE) connection for Real-Time Updates
        const sse = new EventSource('/api/owner/realtime');

        sse.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === 'refresh') {
                    // Database change detected globally. Silently fetch the latest metrics.
                    fetchDashboardData();
                }
            } catch (e) {
                // Ignore parse errors on ping/keep-alive
            }
        };

        sse.onerror = (error) => {
            console.warn("Real-time SSE connection dropped. Will attempt to reconnect automatically.", error);
        };

        // Cleanup the listener when the component unmounts
        return () => {
            sse.close();
        };
    }, [router, currentYear]);

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
                <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
                <p className="text-slate-400 font-medium uppercase tracking-widest text-sm animate-pulse">
                    Aggregating Global Financial Metrics...
                </p>
            </div>
        );
    }

    if (!stats) return null;

    const formatCurrency = (amount: number) => {
        return `₦${(amount || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
    };

    const isProfit = stats.netProfitOrLoss >= 0;

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        <Activity className="w-6 h-6 text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                            Executive <span className="text-emerald-500">Overview</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Real-time financial aggregation for {currentYear}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Link href="/owner/ai-assistant">
                        <Button variant="outline" className="border-indigo-500/30 bg-indigo-500/5 text-indigo-400 hover:bg-indigo-500/10 hover:text-indigo-300 transition-all uppercase tracking-widest text-[10px] font-black font-mono px-4 h-9 flex items-center gap-2">
                            <Sparkles className="w-3.5 h-3.5" />
                            Consult AI
                        </Button>
                    </Link>
                    <Link href="/owner/starting-capital">
                        <Button variant="outline" className="border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-500 transition-colors uppercase tracking-widest text-[10px] font-bold font-mono px-4 h-9">
                            View Blueprint
                        </Button>
                    </Link>
                </div>
            </header>

            {/* The 5-Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {/* 1. Net Profit / Loss */}
                <div className={`glass-panel p-6 rounded-2xl border relative overflow-hidden group lg:col-span-2 ${isProfit ? 'border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.1)]'}`}>
                    <div className={`absolute top-0 right-0 w-64 h-64 blur-3xl rounded-full pointer-events-none ${isProfit ? 'bg-emerald-500/20' : 'bg-rose-500/20'}`} />
                    <div className="relative z-10 flex flex-col justify-between h-full min-h-[160px]">
                        <div className="flex justify-between items-start mb-4">
                            <div className={`p-2 rounded-lg ${isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                                {isProfit ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                            </div>
                            <span className={`hidden md:inline-block px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider border ${isProfit ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                                NET YTD PERFORMANCE
                            </span>
                        </div>
                        <div>
                            <p className={`text-sm font-bold uppercase tracking-widest mb-2 ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'}`}>
                                Net Full-Year {isProfit ? 'Profit' : 'Loss'}
                            </p>
                            <h3 className={`text-5xl md:text-6xl font-black truncate ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {isProfit ? '+ ' : '- '}{formatCurrency(Math.abs(stats.netProfitOrLoss))}
                            </h3>
                        </div>
                    </div>
                </div>

                {/* 2. Total Sales Revenue (Income - Green) */}
                <div className="glass-panel p-6 rounded-2xl border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)] relative overflow-hidden group flex flex-col justify-between min-h-[160px]">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                                <DollarSign size={20} />
                            </div>
                            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-[10px] text-emerald-400 font-mono font-bold">YTD INFLOW</span>
                        </div>
                        <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-1">Total Sales Revenue</p>
                        <h3 className="text-4xl font-black text-emerald-400 tracking-tighter truncate">{formatCurrency(stats.totalSalesRevenue)}</h3>
                    </div>
                </div>

                {/* 3. Amount of Goods Bought */}
                <div className="glass-panel p-6 rounded-2xl border-white/5 hover:border-blue-500/30 transition-colors group flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-500/10 transition-colors shrink-0">
                                <PackageOpen size={20} />
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-[10px] text-blue-400 font-mono shrink-0">YTD ASSETS</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Amount of Goods Bought</p>
                        <h3 className="text-3xl font-black text-white tracking-tighter truncate">
                            {formatCurrency(stats.totalCapitalDeployed)}
                        </h3>
                    </div>
                </div>

                {/* 4. Outstanding Credit */}
                <div className="glass-panel p-6 rounded-2xl border-white/5 hover:border-amber-500/30 transition-colors group flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-white/5 text-slate-400 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-colors">
                                <CreditCard size={20} />
                            </div>
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-[10px] text-amber-500 font-mono">ALL-TIME DEBT</span>
                        </div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Outstanding Credit Owed</p>
                        <h3 className="text-3xl font-black text-amber-500 tracking-tighter truncate">{formatCurrency(stats.outstandingCredit)}</h3>
                    </div>
                </div>

                {/* 5. Total Bank Lodgments (Blue) */}
                <div className="glass-panel p-6 rounded-2xl border-blue-500/40 shadow-[0_0_20px_rgba(59,130,246,0.1)] relative overflow-hidden group flex flex-col justify-between">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                    <div className="relative z-10">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                                <Landmark size={20} />
                            </div>
                            <span className="px-2 py-0.5 rounded bg-blue-500/20 text-[10px] text-blue-400 font-mono font-bold">YTD SECURED</span>
                        </div>
                        <p className="text-xs font-bold text-blue-500/70 uppercase tracking-widest mb-1">Total Bank Lodgments</p>
                        <h3 className="text-3xl font-black text-blue-400 tracking-tighter truncate">{formatCurrency(stats.totalBankLodgmentsYTD)}</h3>
                    </div>
                </div>

            </div>

            {/* Live Activity Feed */}
            <div className="mt-12 glass-panel p-8 rounded-2xl border-white/5">
                <div className="flex items-center gap-3 mb-6">
                    <Activity className="w-5 h-5 text-emerald-500" />
                    <h2 className="text-xl font-bold text-white tracking-tight">Live Platform Activity</h2>
                </div>

                {activities.length === 0 ? (
                    <p className="text-slate-400 text-sm font-medium">No activity logged yet.</p>
                ) : (
                    <div className="space-y-4">
                        {activities.map((act) => (
                            <div key={`${act.type}-${act.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-[#0a0f1d] border border-white/10 flex items-center justify-center shrink-0">
                                        <span className="text-xs font-black text-slate-400">
                                            {act.type.substring(0, 3)}
                                        </span>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white capitalize">
                                            {act.type.toLowerCase().replace('_', ' ')}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs text-emerald-500 font-medium">{act.submittedBy}</p>
                                            <span className="w-1 h-1 rounded-full bg-white/20" />
                                            <p className="text-xs text-slate-500">
                                                {formatDistanceToNow(new Date(act.submittedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-white">{formatCurrency(act.amount)}</p>
                                    {act.description && (
                                        <p className="text-xs text-slate-400 mt-1 max-w-[150px] truncate">{act.description}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
