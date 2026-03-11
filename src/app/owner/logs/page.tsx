"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    History,
    ArrowLeft,
    Loader2,
    Filter,
    ShoppingCart,
    HandCoins,
    Banknote,
    Briefcase,
    Receipt,
    UserCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface AuditLogs {
    adminActivity: {
        purchases: any[];
        collections: any[];
        lodgments: any[];
    };
    salesboyActivity: {
        sales: any[];
        credits: any[];
        expenses: any[];
    };
}

export default function AuditLogsPage() {
    const router = useRouter();
    const [logs, setLogs] = useState<AuditLogs | null>(null);
    const [loading, setLoading] = useState(true);
    const [timeframe, setTimeframe] = useState("7days"); // '7days', '30days', 'all'
    const [error, setError] = useState("");

    useEffect(() => {
        fetchLogs();
    }, [timeframe]);

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/owner/logs?timeframe=${timeframe}`);
            if (res.ok) {
                const data = await res.json();
                setLogs(data);
            } else {
                setError("Failed to load audit logs");
            }
        } catch (err) {
            setError("Network error loading logs");
        } finally {
            setLoading(false);
        }
    };

    const EmptyState = ({ message }: { message: string }) => (
        <div className="p-12 text-center space-y-3 border border-dashed border-white/5 rounded-2xl bg-white/2">
            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-4">
                <History size={24} />
            </div>
            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">{message}</p>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-20">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/owner/dashboard">
                    <Button variant="ghost" className="text-slate-400 hover:text-white gap-2 pl-0">
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Button>
                </Link>

                <div className="flex items-center gap-2 bg-[#0a0f1d] p-1.5 rounded-xl border border-white/5">
                    <Filter size={16} className="text-slate-500 ml-2" />
                    <select
                        className="bg-transparent border-none text-white text-sm font-bold focus:ring-0 outline-none pr-4 cursor-pointer"
                        value={timeframe}
                        onChange={(e) => setTimeframe(e.target.value)}
                    >
                        <option value="7days">Past 7 Days</option>
                        <option value="30days">Past 30 Days</option>
                        <option value="all">All Time</option>
                    </select>
                </div>
            </div>

            <div className="flex items-center gap-4 mb-8">
                <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <History size={32} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-white uppercase tracking-tight italic">System Audit Logs</h1>
                    <p className="text-slate-400 font-medium">Complete historical view of all storefront and administrative activities.</p>
                </div>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                    {error}
                </div>
            )}

            <Tabs defaultValue="salesboy" className="space-y-8">
                <TabsList className="bg-[#0a0f1d] border border-white/5 p-1 rounded-xl h-auto flex flex-col sm:flex-row gap-2 sm:gap-0 shadow-2xl">
                    <TabsTrigger
                        value="salesboy"
                        className="flex-1 text-sm font-bold uppercase tracking-widest py-3 data-[state=active]:bg-emerald-500 data-[state=active]:text-black rounded-lg transition-all"
                    >
                        Storefront (Salesboy)
                    </TabsTrigger>
                    <TabsTrigger
                        value="admin"
                        className="flex-1 text-sm font-bold uppercase tracking-widest py-3 data-[state=active]:bg-amber-500 data-[state=active]:text-black rounded-lg transition-all"
                    >
                        Administrative (Admin)
                    </TabsTrigger>
                </TabsList>

                {/* SALESBOY ACTIVITY TAB */}
                <TabsContent value="salesboy" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                    {/* Standard Sales */}
                    <Card className="glass-panel border-emerald-500/20 overflow-hidden">
                        <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10">
                            <CardTitle className="flex items-center gap-2 text-emerald-500 uppercase tracking-widest text-sm font-black">
                                <ShoppingCart size={18} /> Standard Sales Logs
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div> :
                                logs?.salesboyActivity.sales.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Submitted By</th>
                                                <th className="px-6 py-4">Item / Time</th>
                                                <th className="px-6 py-4 text-right">Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.salesboyActivity.sales.map(s => (
                                                <tr key={s._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white text-sm flex items-center gap-2">
                                                        <UserCircle2 size={14} className="text-slate-500" /> {s.submittedBy}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-slate-300">{s.quantity} {s.unitType}s {s.product?.replace('_', ' ')} @ ₦{s.sellingPricePerUnit}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(s.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-500">₦{(s.totalAmount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No sales records found" />}
                        </CardContent>
                    </Card>

                    {/* Pending Credit */}
                    <Card className="glass-panel border-blue-500/20 overflow-hidden">
                        <CardHeader className="bg-blue-500/5 border-b border-blue-500/10">
                            <CardTitle className="flex items-center gap-2 text-blue-400 uppercase tracking-widest text-sm font-black">
                                <Briefcase size={18} /> Credit Supplies Given
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-400" /></div> :
                                logs?.salesboyActivity.credits.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Submitted By / Time</th>
                                                <th className="px-6 py-4 text-right">Debt Created</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.salesboyActivity.credits.map(c => (
                                                <tr key={c._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white text-sm">{c.customerName}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-xs flex items-center gap-1"><UserCircle2 size={12} /> {c.submittedBy}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(c.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-blue-400">₦{(c.totalAmountOwed || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No credit records found" />}
                        </CardContent>
                    </Card>

                    {/* Operational Expenses */}
                    <Card className="glass-panel border-rose-500/20 overflow-hidden">
                        <CardHeader className="bg-rose-500/5 border-b border-rose-500/10">
                            <CardTitle className="flex items-center gap-2 text-rose-500 uppercase tracking-widest text-sm font-black">
                                <Receipt size={18} /> Operational Expenses
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-rose-500" /></div> :
                                logs?.salesboyActivity.expenses.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Expense Type</th>
                                                <th className="px-6 py-4">Submitted By / Time</th>
                                                <th className="px-6 py-4 text-right">Amount Out</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.salesboyActivity.expenses.map(e => (
                                                <tr key={e._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white text-sm">{e.description}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-xs flex items-center gap-1"><UserCircle2 size={12} /> {e.submittedBy}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(e.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-rose-500">₦{(e.amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No expense records found" />}
                        </CardContent>
                    </Card>

                </TabsContent>

                {/* ADMIN ACTIVITY TAB */}
                <TabsContent value="admin" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">

                    {/* Stock Purchases */}
                    <Card className="glass-panel border-amber-500/20 overflow-hidden">
                        <CardHeader className="bg-amber-500/5 border-b border-amber-500/10">
                            <CardTitle className="flex items-center gap-2 text-amber-500 uppercase tracking-widest text-sm font-black">
                                <ShoppingCart size={18} /> Admin Stock Purchases
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-amber-500" /></div> :
                                logs?.adminActivity.purchases.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Supplier / Item</th>
                                                <th className="px-6 py-4">Admin / Time</th>
                                                <th className="px-6 py-4 text-right">Total Cost</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.adminActivity.purchases.map(p => (
                                                <tr key={p._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <p className="font-bold text-white text-sm">{p.supplierName || "Direct"}</p>
                                                        <p className="text-[10px] text-slate-400">{p.quantity} {p.unitType}s {p.product?.replace('_', ' ')}</p>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-xs flex items-center gap-1"><UserCircle2 size={12} /> {p.submittedBy}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(p.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-amber-500">₦{(p.totalCost || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No purchase records found" />}
                        </CardContent>
                    </Card>

                    {/* Credit Collections */}
                    <Card className="glass-panel border-blue-500/20 overflow-hidden">
                        <CardHeader className="bg-blue-500/5 border-b border-blue-500/10">
                            <CardTitle className="flex items-center gap-2 text-blue-400 uppercase tracking-widest text-sm font-black">
                                <HandCoins size={18} /> Admin Collections
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-blue-400" /></div> :
                                logs?.adminActivity.collections.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Customer</th>
                                                <th className="px-6 py-4">Admin / Time</th>
                                                <th className="px-6 py-4 text-right">Inflow</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.adminActivity.collections.map(c => (
                                                <tr key={c._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white text-sm">{c.customerName}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-xs flex items-center gap-1"><UserCircle2 size={12} /> {c.submittedBy}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(c.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-blue-400">₦{(c.amountCollected || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No collection records found" />}
                        </CardContent>
                    </Card>

                    {/* Bank Lodgments */}
                    <Card className="glass-panel border-emerald-500/20 overflow-hidden">
                        <CardHeader className="bg-emerald-500/5 border-b border-emerald-500/10">
                            <CardTitle className="flex items-center gap-2 text-emerald-500 uppercase tracking-widest text-sm font-black">
                                <Banknote size={18} /> Admin Lodgments
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-emerald-500" /></div> :
                                logs?.adminActivity.lodgments.length ? (
                                    <table className="w-full text-left">
                                        <thead className="bg-white/5 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                            <tr>
                                                <th className="px-6 py-4">Bank Name</th>
                                                <th className="px-6 py-4">Admin / Time</th>
                                                <th className="px-6 py-4 text-right">Deposited</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-white/5">
                                            {logs.adminActivity.lodgments.map(l => (
                                                <tr key={l._id} className="hover:bg-white/5 transition-colors">
                                                    <td className="px-6 py-4 font-bold text-white text-sm">{l.bankName || "Unspecified"}</td>
                                                    <td className="px-6 py-4">
                                                        <p className="text-slate-300 text-xs flex items-center gap-1"><UserCircle2 size={12} /> {l.submittedBy}</p>
                                                        <p className="text-[10px] text-slate-500">{format(new Date(l.submittedAt), "MMM do, hh:mm a")}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-black text-emerald-500">₦{(l.amount || 0).toLocaleString()}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                ) : <EmptyState message="No lodgment records found" />}
                        </CardContent>
                    </Card>

                </TabsContent>
            </Tabs>
        </div>
    );
}
