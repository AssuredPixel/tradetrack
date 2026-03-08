"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Receipt, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function LogExpensePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        description: "",
        amount: 0,
        notes: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/salesboy/log-expense", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/salesboy/dashboard"), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to log expense");
            }
        } catch (err) {
            setError("A network error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <div className="p-4 rounded-full bg-red-500/20 text-red-500 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-black text-white italic">Expense Logged!</h2>
                <p className="text-slate-400">Redirecting to dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button
                variant="ghost"
                onClick={() => router.back()}
                className="mb-8 text-slate-400 hover:text-white gap-2 pl-0"
            >
                <ArrowLeft size={18} />
                Back to Dashboard
            </Button>

            <Card className="glass-panel border-white/5 overflow-hidden">
                <CardHeader className="bg-red-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
                            <Receipt size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Log Expense</CardTitle>
                            <CardDescription className="text-slate-500 font-medium tracking-wide">Record operational cash out</CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold flex items-center gap-3">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
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
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Description (e.g. Generator Fuel)</Label>
                                <Input
                                    placeholder="What was this expense for?"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Amount (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-brand outline-none border-none h-12 text-white text-xl font-black"
                                    value={form.amount || ""}
                                    onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Additional Notes</Label>
                                <textarea
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-red-500/20 outline-none font-medium min-h-[100px]"
                                    placeholder="Any context or justifications..."
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-500 text-white w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-red-500/10 border-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Record Expense"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
