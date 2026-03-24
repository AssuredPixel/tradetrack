"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import {
    ShoppingCart,
    Briefcase,
    Receipt,
    ArrowLeft,
    Loader2,
    Calendar,
    ChevronDown,
    ChevronUp,
    TrendingUp,
    Wallet,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Entry {
    _id: string;
    product: string;
    unitType: string;
    quantity: number;
    sellingPricePerUnit?: number;
    agreedPricePerUnit?: number;
    totalAmount?: number;
    totalAmountOwed?: number;
    amount?: number;
    description?: string;
    customerName?: string;
    submittedAt: string;
    notes?: string;
}

interface DailyEntries {
    sales: Entry[];
    creditSupplies: Entry[];
    expenses: Entry[];
}

export default function TodaysEntriesPage() {
    const router = useRouter();
    const [entries, setEntries] = useState<DailyEntries>({ sales: [], creditSupplies: [], expenses: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEntries() {
            try {
                const res = await fetch("/api/salesboy/entries/today");
                if (res.ok) {
                    const data = await res.json();
                    setEntries(data);
                }
            } catch (err) {
                console.error("Failed to fetch entries", err);
            } finally {
                setLoading(false);
            }
        }
        fetchEntries();
    }, []);

    const totals = {
        sales: entries.sales.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
        credit: entries.creditSupplies.reduce((sum, c) => sum + (c.totalAmountOwed || 0), 0),
        expenses: entries.expenses.reduce((sum, e) => sum + (e.amount || 0), 0),
    };

    const todayDate = format(new Date(), "do MMMM yyyy");

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                <p className="text-slate-400 font-medium">Aggregating daily logs...</p>
            </div>
        );
    }

    const isEmpty = entries.sales.length === 0 && entries.creditSupplies.length === 0 && entries.expenses.length === 0;

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="text-slate-400 hover:text-white gap-2 pl-0"
                >
                    <ArrowLeft size={18} />
                    Dashboard
                </Button>

                <div className="flex items-center gap-3 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                    <Calendar size={18} className="text-emerald-500" />
                    <span className="text-white font-black italic tracking-tight uppercase text-sm">{todayDate}</span>
                </div>
            </div>

            <div className="space-y-16">
                {/* Sales Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <ShoppingCart className="text-emerald-500" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Sales Today</h2>
                        </div>
                        {entries.sales.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Running Total</p>
                                <p className="text-xl font-black text-emerald-500 leading-none">₦{totals.sales.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.sales.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Product</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4">Price/Unit</th>
                                        <th className="px-6 py-4 text-right">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.sales.map((sale) => (
                                        <tr key={sale._id} className="group hover:bg-emerald-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white text-sm">{sale.product.replace('_', ' ')}</p>
                                                <div className="flex flex-col gap-0.5 mt-0.5">
                                                    <p className="text-[10px] text-slate-500">{format(new Date(sale.submittedAt), "hh:mm a")}</p>
                                                    {sale.customerName && (
                                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">
                                                            To: {sale.customerName}
                                                        </p>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{sale.quantity} {sale.unitType}s</td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">₦{(sale.sellingPricePerUnit || 0).toLocaleString()}</td>
                                            <td className="px-6 py-4 text-right font-black text-white">₦{(sale.totalAmount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-emerald-500/5">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-[10px] font-black text-emerald-500/60 uppercase tracking-widest">Daily Closing Sum</td>
                                        <td className="px-6 py-4 text-right font-black text-emerald-500 text-lg">₦{totals.sales.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No sales logged today</p>
                        </div>
                    )}
                </section>

                {/* Credit Supplies Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Briefcase className="text-blue-400" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Credit Supplies Today</h2>
                        </div>
                        {entries.creditSupplies.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Total Owed Today</p>
                                <p className="text-xl font-black text-blue-400 leading-none">₦{totals.credit.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.creditSupplies.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Customer</th>
                                        <th className="px-6 py-4">Item</th>
                                        <th className="px-6 py-4">Qty</th>
                                        <th className="px-6 py-4 text-right">Amount Owed</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.creditSupplies.map((credit) => (
                                        <tr key={credit._id} className="group hover:bg-blue-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white text-sm">{credit.customerName}</p>
                                                <p className="text-[10px] text-slate-500">{format(new Date(credit.submittedAt), "hh:mm a")}</p>
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{credit.product.replace('_', ' ')}</td>
                                            <td className="px-6 py-4 text-slate-300 text-sm">{credit.quantity} {credit.unitType}s</td>
                                            <td className="px-6 py-4 text-right font-black text-white">₦{(credit.totalAmountOwed || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-blue-500/5">
                                    <tr>
                                        <td colSpan={3} className="px-6 py-4 text-right text-[10px] font-black text-blue-400/60 uppercase tracking-widest">Total Daily Debt</td>
                                        <td className="px-6 py-4 text-right font-black text-blue-400 text-lg">₦{totals.credit.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No credit supplies logged today</p>
                        </div>
                    )}
                </section>

                {/* Expenses Section */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-3">
                            <Receipt className="text-red-500" size={24} />
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight">Expenses Today</h2>
                        </div>
                        {entries.expenses.length > 0 && (
                            <div className="text-right">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Daily Burn</p>
                                <p className="text-xl font-black text-red-500 leading-none">₦{totals.expenses.toLocaleString()}</p>
                            </div>
                        )}
                    </div>

                    {entries.expenses.length > 0 ? (
                        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#0a0f1d]">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                    <tr>
                                        <th className="px-6 py-4">Description</th>
                                        <th className="px-6 py-4">Time</th>
                                        <th className="px-6 py-4 text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {entries.expenses.map((expense) => (
                                        <tr key={expense._id} className="group hover:bg-red-500/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <p className="font-bold text-white text-sm">{expense.description}</p>
                                                {expense.notes && <p className="text-[10px] text-slate-500 italic mt-0.5">{expense.notes}</p>}
                                            </td>
                                            <td className="px-6 py-4 text-slate-300 text-sm uppercase text-[10px] tracking-widest">{format(new Date(expense.submittedAt), "hh:mm a")}</td>
                                            <td className="px-6 py-4 text-right font-black text-white">₦{(expense.amount || 0).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                                <tfoot className="bg-red-500/5">
                                    <tr>
                                        <td colSpan={2} className="px-6 py-4 text-right text-[10px] font-black text-red-500/60 uppercase tracking-widest">Daily Outflow Sum</td>
                                        <td className="px-6 py-4 text-right font-black text-red-500 text-lg">₦{totals.expenses.toLocaleString()}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                            <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No expenses logged today</p>
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
}
