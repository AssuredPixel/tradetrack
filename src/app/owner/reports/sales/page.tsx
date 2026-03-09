"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, TrendingUp, PackageOpen, DollarSign, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReportPeriodSelector from "@/components/ReportPeriodSelector";

interface SaleEntry {
    _id: string;
    date: string;
    product: string;
    unitType: string;
    quantity: number;
    sellingPricePerUnit: number;
    totalAmount: number;
    notes?: string;
    submittedBy: string;
    submittedAt: string;
}

interface ProductBreakdown {
    product: string;
    quantity: number;
    revenue: number;
    avgPrice: number;
}

interface SalesReportData {
    period: { start: string; end: string };
    totalRevenue: number;
    breakdown: ProductBreakdown[];
    entries: SaleEntry[];
}

function SalesReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<SalesReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReport() {
            setLoading(true);
            setError(null);
            try {
                // Pass all query params down to the API
                const queryStr = searchParams.toString();
                const res = await fetch(`/api/owner/reports/sales${queryStr ? `?${queryStr}` : ''}`);

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

    const formatCurrency = (amount: number) => `₦${(amount || 0).toLocaleString()}`;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
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
                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <TrendingUp className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        Sales <span className="text-emerald-500">Report</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Revenue generation analysis</p>
                </div>
            </div>

            <ReportPeriodSelector />

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Aggregating Data...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-rose-500 font-bold">{error}</p>
                </div>
            ) : !data ? null : (
                <div className="space-y-12">

                    {/* Top Level Stat */}
                    <div className="glass-panel p-8 rounded-2xl border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-emerald-500/70 uppercase tracking-widest mb-2">Total Sales Revenue</h2>
                                <h3 className="text-5xl font-black text-emerald-400 tracking-tighter truncate">
                                    {formatCurrency(data.totalRevenue)}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                <Calendar size={18} className="text-emerald-500" />
                                <span className="text-xs font-bold text-emerald-400">
                                    {data.entries.length} Transaction{data.entries.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    {data.breakdown.length > 0 && (
                        <section className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <PackageOpen className="text-slate-400" />
                                Product Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.breakdown.map((item) => (
                                    <div key={item.product} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-emerald-500/30 transition-all group">
                                        <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide group-hover:text-emerald-400 transition-colors">
                                            {item.product.replace('_', ' ')}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Revenue</span>
                                                <span className="text-xl font-black text-white">{formatCurrency(item.revenue)}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qty Sold</span>
                                                <span className="text-sm font-medium text-slate-300">{item.quantity} units</span>
                                            </div>
                                            <div className="flex justify-between items-end border-t border-white/5 pt-3 mt-1">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Avg Price</span>
                                                <span className="text-sm font-medium text-slate-300">{formatCurrency(item.avgPrice)}/unit</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Entries List */}
                    <section className="space-y-6">
                        <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                            <DollarSign className="text-slate-400" />
                            Detailed Transactions
                        </h3>

                        {data.entries.length === 0 ? (
                            <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                                <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No sales found for this period</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0f1d] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Product</th>
                                            <th className="px-6 py-4">Qty</th>
                                            <th className="px-6 py-4">Price/Unit</th>
                                            <th className="px-6 py-4 text-right">Total</th>
                                            <th className="px-6 py-4">Logged By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.entries.map((sale) => (
                                            <tr key={sale._id} className="group hover:bg-emerald-500/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white text-sm">{format(new Date(sale.date), "MMM do, yyyy")}</p>
                                                    <p className="text-[10px] text-slate-500">{format(new Date(sale.submittedAt), "hh:mm a")}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white text-sm">{sale.product.replace('_', ' ')}</p>
                                                    {sale.notes && <p className="text-[10px] text-slate-500 max-w-[200px] truncate">{sale.notes}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300 text-sm">{sale.quantity} {sale.unitType}s</td>
                                                <td className="px-6 py-4 text-slate-300 text-sm">{formatCurrency(sale.sellingPricePerUnit)}</td>
                                                <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(sale.totalAmount)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase">{sale.submittedBy}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </section>

                </div>
            )}
        </div>
    );
}

export default function SalesReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-emerald-500" /></div>}>
            <SalesReportContent />
        </Suspense>
    );
}
