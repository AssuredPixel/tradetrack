"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, Loader2, CreditCard, ChevronDown, ChevronUp, History, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ReportPeriodSelector from "@/components/ReportPeriodSelector";

interface Transaction {
    _id: string;
    date: string;
    type: "SUPPLY" | "COLLECTION";
    amount: number;
    product?: string;
    quantity?: number;
    unitType?: string;
    notes?: string;
    submittedBy: string;
    submittedAt: string;
}

interface CustomerLedger {
    customerName: string;
    totalSupplied: number;
    totalCollected: number;
    balance: number;
    transactions: Transaction[];
}

interface CreditLedgerData {
    period: { start: string; end: string };
    activeCustomers: CustomerLedger[];
    clearedCustomers: CustomerLedger[];
}

function CreditLedgerContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<CreditLedgerData | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [expandedCustomers, setExpandedCustomers] = useState<Set<string>>(new Set());
    const [showCleared, setShowCleared] = useState(false);

    useEffect(() => {
        async function fetchReport() {
            setLoading(true);
            setError(null);
            try {
                const queryStr = searchParams.toString();
                const res = await fetch(`/api/owner/reports/credit-ledger${queryStr ? `?${queryStr}` : ''}`);

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

    const formatCurrency = (amount: number) => `₦${(Math.abs(amount) || 0).toLocaleString()}`;

    const toggleExpand = (customerName: string) => {
        const newSet = new Set(expandedCustomers);
        if (newSet.has(customerName)) newSet.delete(customerName);
        else newSet.add(customerName);
        setExpandedCustomers(newSet);
    };

    const renderCustomerRow = (customer: CustomerLedger, isActive: boolean) => {
        const isExpanded = expandedCustomers.has(customer.customerName);
        return (
            <div key={customer.customerName} className="glass-panel overflow-hidden border-white/5 rounded-2xl mb-4 transition-all">
                <div
                    onClick={() => toggleExpand(customer.customerName)}
                    className="p-6 flex flex-col md:flex-row items-center justify-between cursor-pointer hover:bg-white/[0.02] transition-colors"
                >
                    <div className="flex items-center gap-4 w-full md:w-auto mb-4 md:mb-0">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 border ${isActive ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                            }`}>
                            {isActive ? <CreditCard size={20} /> : <CheckCircle2 size={20} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white capitalize">{customer.customerName}</h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-xs text-slate-500 font-medium">
                                    Supplied: <span className="text-slate-300 font-mono">{formatCurrency(customer.totalSupplied)}</span>
                                </span>
                                <span className="w-1 h-1 rounded-full bg-white/20" />
                                <span className="text-xs text-slate-500 font-medium">
                                    Collected: <span className="text-slate-300 font-mono">{formatCurrency(customer.totalCollected)}</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between w-full md:w-auto md:gap-8">
                        <div className="text-left md:text-right">
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">
                                {isActive ? 'Total Outstanding' : 'Account Cleared'}
                            </p>
                            <p className={`text-2xl font-black ${isActive ? 'text-amber-500' : 'text-emerald-500'}`}>
                                {formatCurrency(customer.balance)}
                            </p>
                        </div>
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white pointer-events-none shrink-0">
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </Button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="border-t border-white/5 bg-[#0a0f1d]/50 p-6">
                        <h4 className="text-sm font-bold text-white uppercase tracking-widest flex items-center gap-2 mb-4">
                            <History size={16} className="text-slate-400" />
                            Transaction History ({customer.transactions.length})
                        </h4>

                        {customer.transactions.length === 0 ? (
                            <p className="text-slate-500 text-sm italic py-4">No transactions recorded for this customer in the selected period.</p>
                        ) : (
                            <div className="space-y-3">
                                {customer.transactions.map((tx) => (
                                    <div key={tx._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-[#0a0f1d] gap-4">
                                        <div className="flex items-start gap-3">
                                            <div className="mt-1">
                                                {tx.type === 'SUPPLY' ? (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-amber-500/20 text-amber-500">Supply</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-500">Collection</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-white text-sm">
                                                    {tx.type === 'SUPPLY'
                                                        ? `${tx.quantity} ${tx.unitType}s of ${tx.product?.replace('_', ' ')}`
                                                        : 'Debt Recovery Payment'
                                                    }
                                                </p>
                                                <p className="text-[10px] text-slate-500 mt-1">
                                                    {format(new Date(tx.date), "MMM do, yyyy")} • Logged by {tx.submittedBy}
                                                </p>
                                                {tx.notes && <p className="text-xs text-slate-400 mt-1 italic">{tx.notes}</p>}
                                            </div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <p className={`font-black ${tx.type === 'SUPPLY' ? 'text-amber-500' : 'text-emerald-500'}`}>
                                                {tx.type === 'SUPPLY' ? '+' : '-'}{formatCurrency(tx.amount)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
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
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <CreditCard className="w-6 h-6 text-amber-500" />
                </div>
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                        Credit <span className="text-amber-500">Ledger</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium">Customer debt and collections</p>
                </div>
            </div>

            <ReportPeriodSelector />

            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-amber-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Auditing Accounts...</p>
                </div>
            ) : error ? (
                <div className="p-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 text-center">
                    <p className="text-rose-500 font-bold">{error}</p>
                </div>
            ) : !data ? null : (
                <div className="space-y-8">

                    {/* Active Customers Section */}
                    <div>
                        <div className="flex items-end justify-between mb-6 border-b border-white/5 pb-4 px-2">
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-2">
                                    Active Customers
                                </h2>
                                <p className="text-slate-500 text-sm font-medium mt-1">Customers with outstanding balances</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-amber-500/60 uppercase tracking-widest mb-1">Grand Total Outstanding</p>
                                <p className="text-3xl font-black text-amber-500 leading-none">
                                    {formatCurrency(data.activeCustomers.reduce((sum, c) => sum + c.balance, 0))}
                                </p>
                            </div>
                        </div>

                        {data.activeCustomers.length === 0 ? (
                            <div className="p-12 rounded-2xl border border-dashed border-white/5 text-center bg-white/2">
                                <p className="text-slate-600 font-bold italic text-lg uppercase tracking-tight">No active credit accounts</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {data.activeCustomers.map(c => renderCustomerRow(c, true))}
                            </div>
                        )}
                    </div>

                    {/* Cleared Customers Section (Collapsible) */}
                    {data.clearedCustomers.length > 0 && (
                        <div className="pt-8">
                            <Button
                                variant="outline"
                                className="w-full border-white/5 hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-500 text-slate-400 py-6 mb-6"
                                onClick={() => setShowCleared(!showCleared)}
                            >
                                {showCleared ? <ChevronUp size={18} className="mr-2" /> : <ChevronDown size={18} className="mr-2" />}
                                {showCleared ? "Hide Cleared Accounts" : `View Cleared Accounts (${data.clearedCustomers.length})`}
                            </Button>

                            {showCleared && (
                                <div className="space-y-2 animate-in slide-in-from-top-4 fade-in duration-300">
                                    {data.clearedCustomers.map(c => renderCustomerRow(c, false))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function CreditLedgerPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-amber-500" /></div>}>
            <CreditLedgerContent />
        </Suspense>
    );
}
