"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    ShoppingCart,
    HandCoins,
    Banknote,
    ArrowLeft,
    Loader2,
    Calendar,
    ChevronDown,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Entry {
    _id: string;
    product?: string;
    unitType?: string;
    quantity?: number;
    purchasePricePerUnit?: number;
    totalCost?: number;
    supplierName?: string;
    customerName?: string;
    amountCollected?: number;
    amount?: number;
    bankName?: string;
    submittedAt: string;
    notes?: string;
}

interface AdminEntries {
    purchases: Entry[];
    collections: Entry[];
    lodgments: Entry[];
}

export default function AdminTodayPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<AdminEntries>({ purchases: [], collections: [], lodgments: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEntries() {
            try {
                const res = await fetch("/api/admin/entries/today");
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data);
                }
            } catch (err) {
                console.error("Failed to fetch admin entries", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEntries();
    }, []);

    const totals = {
        purchases: entries.purchases.reduce((sum, p) => sum + (p.totalCost || 0), 0),
        collections: entries.collections.reduce((sum, c) => sum + (c.amountCollected || 0), 0),
        lodgments: entries.lodgments.reduce((sum, l) => sum + (l.amount || 0), 0),
    };

    const todayDate = format(new Date(), "do MMMM yyyy");

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                <p className="text-slate-400 font-medium italic">Collating admin logs...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/admin/dashboard">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white gap-2 pl-0"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                    <ShieldCheck size={18} className="text-emerald-500" />
                    <span className="text-white font-black italic tracking-tight uppercase text-sm">{todayDate}</span>
                </div>
            </div>

            <div className="space-y-16">
                {/* Purchases Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="text-amber-500" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Purchases Today</h2>
                        </div>
                        {entries.purchases.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Cost</p>
                                <p className="text-xl font-black text-amber-500 leading-none">₦{totals.purchases.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.purchases.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Supplier / Item</th>
                                        <th className="px-6 py-4">Quantity</th>
                                        <th className="px-6 py-4 text-right">Price/Unit</th>
                                        <th className="px-6 py-4 text-right">Cost</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.purchases.map((p) => (
                                        <tr key={p._id} className="group hover:bg-amber-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white text-sm">{p.supplierName || "Direct Purchase"}</p>
                                                <p className="text-[10px] text-slate-500">{p.product?.replace('_', ' ')} • {format(new Date(p.submittedAt), "hh:mm a")}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{p.quantity} {p.unitType}s</td>
                                            <td className="px-6 py-4 text-right text-slate-400 text-sm">₦{(p.purchasePricePerUnit || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-black text-white">₦{(p.totalCost || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/2 border-t border-white/5">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Running Total:</td>
                                        <td className="px-6 py-4 text-right font-black text-amber-500 text-lg">₦{totals.purchases.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No stock purchases today</p>
                        </div>
                    )}
                </section>

                {/* Collections Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <HandCoins className="text-blue-400" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Collections Today</h2>
                        </div>
                        {entries.collections.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Inflow Total</p>
                                <p className="text-xl font-black text-blue-400 leading-none">₦{totals.collections.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.collections.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4 text-right">Amount Collected</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.collections.map((c) => (
                                        <tr key={c._id} className="group hover:bg-blue-500/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white text-sm">{c.customerName}</td>
                                            <td className="px-6 py-4 text-slate-300 text-xs tracking-widest uppercase">{format(new Date(c.submittedAt), "hh:mm a")}</td>
                                            <td className="px-6 py-4 text-right font-black text-blue-400">₦{(c.amountCollected || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/2 border-t border-white/5">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Running Total:</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-400 text-lg">₦{totals.collections.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No credit collections today</p>
                        </div>
                    )}
                </section>

                {/* Lodgments Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Banknote className="text-emerald-500" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight italic">Lodgments Today</h2>
                        </div>
                        {entries.lodgments.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Bank Total</p>
                                <p className="text-xl font-black text-emerald-500 leading-none">₦{totals.lodgments.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.lodgments.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Bank</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.lodgments.map((l) => (
                                        <tr key={l._id} className="group hover:bg-emerald-500/5 transition-colors">
                                            <td className="px-6 py-4 font-bold text-white text-sm">{l.bankName || "Unspecified Bank"}</td>
                                            <td className="px-6 py-4 text-slate-300 text-xs tracking-widest uppercase">{format(new Date(l.submittedAt), "hh:mm a")}</td>
                                            <td className="px-6 py-4 text-right font-black text-emerald-500">₦{(l.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-white/2 border-t border-white/5">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Running Total:</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-500 text-lg">₦{totals.lodgments.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No bank lodgments today</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
