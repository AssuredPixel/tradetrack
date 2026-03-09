"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, LineChart, TrendingUp, TrendingDown, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReportPeriodSelector from "@/components/ReportPeriodSelector";

interface PnLReportData {
    period: { start: string; end: string };
    totalSalesRevenue: number;
    totalCOGS: number;
    grossProfit: number;
    totalExpenses: number;
    netProfit: number;
}

function PnLReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PnLReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReport() {
            setLoading(true);
            setError(null);
            try {
                const queryStr = searchParams.toString();
                const res = await fetch(`/api/owner/reports/pnl${queryStr ? `?${queryStr}` : ''}`);

                if (!res.ok) throw new Error("Failed to fetch report");

                const responseData = await res.json();
                setData(responseData);
            } catch (err) {
                console.error(err);
                setError(err instanceof Error ? err.message : "An error occurred");
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
    }, [searchParams]);

    const formatCurrency = (amount: number) => {
        const isNegative = amount < 0;
        const absAmount = Math.abs(amount);
        return `${isNegative ? '-' : ''}₦${(absAmount || 0).toLocaleString()}`;
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.push("/owner/reports")}
                    className="text-slate-400 hover:text-white gap-2 pl-0"
                >
                    <ArrowLeft size={18} />
                    Back to Reports
                </Button>
            </div>

            <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20">
                    <LineChart className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        Profit & <span className="text-purple-500">Loss</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Income Statement Analysis</p>
                </div>
            </div>

            <ReportPeriodSelector />

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-purple-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Calculating Bottom Line...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-rose-500 font-bold">{error}</p>
                </div>
            ) : !data ? null : (
                <div className="space-y-6">

                    {/* The P&L Statement */}
                    <Card className="glass-panel border-white/5 overflow-hidden">
                        <div className="bg-[#0a0f1d] p-8 md:p-12">
                            <h2 className="text-center text-xl font-black uppercase tracking-[0.2em] text-white mb-10 pb-6 border-b border-white/10">
                                Profit and Loss Statement
                            </h2>

                            <div className="space-y-8 px-4 sm:px-8">

                                {/* 1. Revenue Section */}
                                <div className="space-y-4 relative">
                                    <div className="flex items-center gap-3 text-emerald-500/80 mb-2">
                                        <TrendingUp size={18} />
                                        <h3 className="font-bold uppercase tracking-widest text-xs">Gross Revenue</h3>
                                    </div>
                                    <div className="flex justify-between items-end pl-8">
                                        <span className="text-slate-300 font-medium">Total Sales Revenue</span>
                                        <span className="text-xl font-black text-white">{formatCurrency(data.totalSalesRevenue)}</span>
                                    </div>
                                    <div className="absolute -left-2 top-8 bottom-0 w-0.5 bg-emerald-500/20" />
                                </div>

                                {/* 2. COGS Section */}
                                <div className="space-y-4 relative">
                                    <div className="flex items-center gap-3 text-amber-500/80 mb-2">
                                        <ShoppingCart size={18} />
                                        <h3 className="font-bold uppercase tracking-widest text-xs">Cost of Sales</h3>
                                    </div>
                                    <div className="flex justify-between items-end pl-8">
                                        <span className="text-slate-300 font-medium">Total Cost of Goods Sold (COGS)</span>
                                        <span className="text-xl font-black text-white">{formatCurrency(data.totalCOGS)}</span>
                                    </div>
                                    <div className="absolute -left-2 top-8 bottom-0 w-0.5 bg-amber-500/20" />
                                </div>

                                {/* Gross Profit Subtotal */}
                                <div className="flex justify-between items-center py-6 border-y border-white/10 bg-white/[0.02] -mx-4 sm:-mx-8 px-4 sm:px-8">
                                    <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm">Gross Profit</span>
                                    <span className="text-2xl font-black text-emerald-400">{formatCurrency(data.grossProfit)}</span>
                                </div>

                                {/* 3. Expenses Section */}
                                <div className="space-y-4 relative pt-4">
                                    <div className="flex items-center gap-3 text-rose-500/80 mb-2">
                                        <TrendingDown size={18} />
                                        <h3 className="font-bold uppercase tracking-widest text-xs">Operating Expenses</h3>
                                    </div>
                                    <div className="flex justify-between items-end pl-8">
                                        <span className="text-slate-300 font-medium">Total Operating Expenses</span>
                                        <span className="text-xl font-black text-white">{formatCurrency(data.totalExpenses)}</span>
                                    </div>
                                    <div className="absolute -left-2 top-12 bottom-0 w-0.5 bg-rose-500/20" />
                                </div>

                            </div>
                        </div>

                        {/* Net Profit Final */}
                        <div className={`p-8 md:p-12 relative overflow-hidden ${data.netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                            }`}>
                            <div className={`absolute top-0 left-0 right-0 h-1 ${data.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />
                            <div className={`absolute bottom-0 right-0 w-64 h-64 blur-3xl rounded-full opacity-20 pointer-events-none ${data.netProfit >= 0 ? 'bg-emerald-500' : 'bg-rose-500'
                                }`} />

                            <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                                <div>
                                    <h3 className={`text-sm font-bold uppercase tracking-[0.2em] mb-2 ${data.netProfit >= 0 ? 'text-emerald-500/80' : 'text-rose-500/80'
                                        }`}>
                                        {data.netProfit >= 0 ? 'Net Profit' : 'Net Loss'}
                                    </h3>
                                    <p className="text-slate-400 text-sm max-w-sm">
                                        The final bottom-line performance for the selected period after all costs and expenses are deducted.
                                    </p>
                                </div>
                                <div className={`text-5xl md:text-6xl font-black tracking-tighter ${data.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                                    }`}>
                                    {formatCurrency(data.netProfit)}
                                </div>
                            </div>
                        </div>
                    </Card>

                </div>
            )}
        </div>
    );
}

export default function PnLReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-purple-500" /></div>}>
            <PnLReportContent />
        </Suspense>
    );
}
