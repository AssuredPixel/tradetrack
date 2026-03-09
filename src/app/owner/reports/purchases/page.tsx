"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, PackageOpen, Truck, Landmark, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReportPeriodSelector from "@/components/ReportPeriodSelector";

interface PurchaseEntry {
    _id: string;
    date: string;
    product: string;
    unitType: string;
    quantity: number;
    purchasePricePerUnit: number;
    totalCost: number;
    supplierName?: string;
    notes?: string;
    submittedBy: string;
    submittedAt: string;
}

interface ProductBreakdown {
    product: string;
    quantity: number;
    cost: number;
    avgPrice: number;
}

interface PurchasesReportData {
    period: { start: string; end: string };
    totalCost: number;
    breakdown: ProductBreakdown[];
    entries: PurchaseEntry[];
}

function PurchasesReportContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<PurchasesReportData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchReport() {
            setLoading(true);
            setError(null);
            try {
                // Pass all query params down to the API
                const queryStr = searchParams.toString();
                const res = await fetch(`/api/owner/reports/purchases${queryStr ? `?${queryStr}` : ''}`);

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
                <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20">
                    <PackageOpen className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        Stock <span className="text-blue-500">Purchases</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Inventory acquisitions analysis</p>
                </div>
            </div>

            <ReportPeriodSelector />

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-blue-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Aggregating Data...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-rose-500 font-bold">{error}</p>
                </div>
            ) : !data ? null : (
                <div className="space-y-12">

                    {/* Top Level Stat */}
                    <div className="glass-panel p-8 rounded-2xl border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-3xl rounded-full pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div>
                                <h2 className="text-sm font-bold text-blue-500/70 uppercase tracking-widest mb-2">Total Capital Deployed</h2>
                                <h3 className="text-5xl font-black text-blue-400 tracking-tighter truncate">
                                    {formatCurrency(data.totalCost)}
                                </h3>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                                <Calendar size={18} className="text-blue-500" />
                                <span className="text-xs font-bold text-blue-400">
                                    {data.entries.length} Transaction{data.entries.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Breakdown */}
                    {data.breakdown.length > 0 && (
                        <section className="space-y-6">
                            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                <Truck className="text-slate-400" />
                                Product Breakdown
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.breakdown.map((item) => (
                                    <div key={item.product} className="glass-panel p-6 rounded-2xl border-white/5 hover:border-blue-500/30 transition-all group">
                                        <h4 className="text-lg font-bold text-white mb-4 uppercase tracking-wide group-hover:text-blue-400 transition-colors">
                                            {item.product.replace('_', ' ')}
                                        </h4>
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Cost</span>
                                                <span className="text-xl font-black text-white">{formatCurrency(item.cost)}</span>
                                            </div>
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Qty Bought</span>
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
                            <Landmark className="text-slate-400" />
                            Detailed Transactions
                        </h3>

                        {data.entries.length === 0 ? (
                            <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                                <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No purchases found for this period</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0f1d] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                                <table className="w-full text-left min-w-[800px]">
                                    <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        <tr>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Supplier / Product</th>
                                            <th className="px-6 py-4">Qty</th>
                                            <th className="px-6 py-4">Price/Unit</th>
                                            <th className="px-6 py-4 text-right">Total Cost</th>
                                            <th className="px-6 py-4">Logged By</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {data.entries.map((purchase) => (
                                            <tr key={purchase._id} className="group hover:bg-blue-500/5 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white text-sm">{format(new Date(purchase.date), "MMM do, yyyy")}</p>
                                                    <p className="text-[10px] text-slate-500">{format(new Date(purchase.submittedAt), "hh:mm a")}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="font-bold text-white text-sm">{purchase.product.replace('_', ' ')}</p>
                                                    {purchase.supplierName ? (
                                                        <p className="text-[10px] text-slate-400 mt-0.5">Supplier: {purchase.supplierName}</p>
                                                    ) : null}
                                                    {purchase.notes && <p className="text-[10px] text-slate-500 mt-0.5 max-w-[200px] truncate">{purchase.notes}</p>}
                                                </td>
                                                <td className="px-6 py-4 text-slate-300 text-sm">{purchase.quantity} {purchase.unitType}s</td>
                                                <td className="px-6 py-4 text-slate-300 text-sm">{formatCurrency(purchase.purchasePricePerUnit)}</td>
                                                <td className="px-6 py-4 text-right font-black text-white">{formatCurrency(purchase.totalCost)}</td>
                                                <td className="px-6 py-4 text-slate-500 text-xs font-bold uppercase">{purchase.submittedBy}</td>
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

export default function PurchasesReportPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-blue-500" /></div>}>
            <PurchasesReportContent />
        </Suspense>
    );
}
