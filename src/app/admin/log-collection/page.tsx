"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { HandCoins, ArrowLeft, Loader2, CheckCircle2, AlertTriangle, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

interface Creditor {
    name: string;
    balance: number;
}

export default function LogCollectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [fetchingCreditors, setFetchingCreditors] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [isCleared, setIsCleared] = useState(false);

    const [creditors, setCreditors] = useState<Creditor[]>([]);
    const [selectedCreditorBalance, setSelectedCreditorBalance] = useState<number | null>(null);

    // Warning Dialog State
    const [showWarning, setShowWarning] = useState(false);
    const [pendingSubmit, setPendingSubmit] = useState(false);

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        customerName: "",
        amountCollected: 0,
        notes: "",
    });

    useEffect(() => {
        async function loadCreditors() {
            try {
                const res = await fetch("/api/admin/creditors");
                if (res.ok) {
                    const data = await res.json();
                    setCreditors(data.creditors);
                }
            } catch (err) {
                console.error("Failed to load creditors", err);
            } finally {
                setFetchingCreditors(false);
            }
        }
        loadCreditors();
    }, []);

    const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const name = e.target.value;
        setForm({ ...form, customerName: name });
        const creditor = creditors.find(c => c.name === name);
        setSelectedCreditorBalance(creditor ? creditor.balance : null);
    };

    const remainingBalance = selectedCreditorBalance !== null
        ? Math.max(0, selectedCreditorBalance - form.amountCollected)
        : null;

    const checkBalanceAndSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        if (!form.customerName) {
            setError("Please select a customer");
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Check if collection exceeds balance (using current balance)
            const currentBalance = selectedCreditorBalance || 0;
            if (!pendingSubmit && form.amountCollected > currentBalance) {
                setShowWarning(true);
                setLoading(false);
                return;
            }

            // Proceed with submission
            const res = await fetch("/api/admin/log-collection", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                if (currentBalance - form.amountCollected <= 0) {
                    setIsCleared(true);
                }
                setSuccess(true);
                setTimeout(() => router.push("/admin/dashboard"), 3000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to log collection");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "A network error occurred");
        } finally {
            setLoading(false);
            setShowWarning(false);
            setPendingSubmit(false);
        }
    };

    const handleConfirmWarning = () => {
        setPendingSubmit(true);
        checkBalanceAndSubmit();
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-4 rounded-full bg-blue-500/20 text-blue-500 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-white italic text-center uppercase tracking-tight">
                        {isCleared ? "Balance Fully Cleared!" : "Payment Collected!"}
                    </h2>
                    <p className="text-slate-400 font-medium">
                        {isCleared ? "This customer record is now debt-free." : "Recording transaction and redirecting..."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto relative">
            {/* Warning Overlay */}
            {showWarning && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel border-amber-500/50 max-w-md w-full p-8 space-y-6 shadow-2xl shadow-amber-500/10">
                        <div className="flex items-center gap-4 text-amber-500">
                            <div className="p-3 rounded-full bg-amber-500/10">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic">Balance Warning</h3>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed">
                            The amount collected is <span className="text-white font-bold">more than the known balance</span> for this customer. Do you still want to save this?
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setShowWarning(false)}
                                variant="ghost"
                                className="flex-1 h-12 text-slate-400 hover:text-white font-bold uppercase tracking-widest"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleConfirmWarning}
                                className="flex-1 h-12 bg-amber-500 hover:bg-amber-400 text-black font-black uppercase tracking-widest shadow-lg shadow-amber-500/20"
                            >
                                Confirm
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Link href="/admin/dashboard">
                <Button
                    variant="ghost"
                    className="mb-8 text-slate-400 hover:text-white gap-2 pl-0"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Button>
            </Link>

            <Card className="glass-panel border-white/5 overflow-hidden">
                <CardHeader className="bg-blue-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                            <HandCoins size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Log Credit Collection</CardTitle>
                            <CardDescription className="text-blue-400 font-bold tracking-wide italic">
                                Partial payments are supported. The customer&apos;s balance will be reduced automatically.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={checkBalanceAndSubmit}>
                    <CardContent className="space-y-6 pt-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date</Label>
                                    <Input
                                        type="date"
                                        className="input-brand outline-none border-none h-12 text-white"
                                        value={form.date}
                                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">
                                        Select Creditor
                                    </Label>
                                    <div className="relative">
                                        <select
                                            className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none font-medium pr-10"
                                            value={form.customerName}
                                            onChange={handleCustomerChange}
                                            required
                                            disabled={fetchingCreditors}
                                        >
                                            <option value="" disabled>{fetchingCreditors ? "Loading creditors..." : "Choose a customer"}</option>
                                            {creditors.length === 0 && !fetchingCreditors && (
                                                <option value="" disabled>No active creditors found</option>
                                            )}
                                            {creditors.map(c => (
                                                <option key={c.name} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                                            {fetchingCreditors ? <Loader2 size={16} className="animate-spin" /> : <UserCircle2 size={16} />}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {selectedCreditorBalance !== null && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Current Debt</p>
                                        <p className="text-xl font-black text-white">₦{selectedCreditorBalance.toLocaleString()}</p>
                                    </div>
                                    <div className={`p-4 rounded-xl border transition-colors ${remainingBalance === 0 ? "bg-emerald-500/10 border-emerald-500/20" : "bg-white/5 border-white/5"}`}>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Remaining After</p>
                                        <p className={`text-xl font-black ${remainingBalance === 0 ? "text-emerald-500" : "text-blue-400"}`}>
                                            ₦{(remainingBalance || 0).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Amount Collected (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-brand outline-none border-none h-14 text-white text-2xl font-black"
                                    value={form.amountCollected || ""}
                                    onChange={(e) => setForm({ ...form, amountCollected: Number(e.target.value) })}
                                    required
                                    min={1}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Collection Notes</Label>
                                <textarea
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium min-h-[100px]"
                                    placeholder="Special terms, receipt numbers, etc."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            type="submit"
                            disabled={loading || fetchingCreditors}
                            className="bg-blue-600 hover:bg-blue-500 text-white w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 border-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Verifying Balance...</span>
                                </div>
                            ) : (
                                "RECORD COLLECTION"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
