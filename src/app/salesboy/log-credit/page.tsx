"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Product } from "@/lib/types";

export default function LogCreditPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        customerName: "",
        product: Product.FLOUR,
        unitType: "Bag",
        quantity: 0,
        agreedPricePerUnit: 0,
        notes: "",
    });

    const totalAmountOwed = form.quantity * form.agreedPricePerUnit;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/salesboy/log-credit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, totalAmountOwed }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/salesboy/dashboard"), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to log credit supply");
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
                <div className="p-4 rounded-full bg-blue-500/20 text-blue-500 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-black text-white italic">Credit Logged!</h2>
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
                <CardHeader className="bg-blue-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500">
                            <Briefcase size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Log Credit Supply</CardTitle>
                            <CardDescription className="text-slate-500 font-medium tracking-wide">Record goods supplied on credit</CardDescription>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Date</Label>
                                <Input
                                    type="date"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.date}
                                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Customer Name</Label>
                                <Input
                                    placeholder="Enter customer name"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.customerName}
                                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Product</Label>
                                <select
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-blue-500/20 outline-none appearance-none font-medium"
                                    value={form.product}
                                    onChange={(e) => setForm({ ...form, product: e.target.value as Product })}
                                    required
                                >
                                    {Object.values(Product).map(p => (
                                        <option key={p} value={p}>{p.replace('_', ' ')}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Unit Type</Label>
                                <Input
                                    placeholder="Bag"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.unitType}
                                    onChange={(e) => setForm({ ...form, unitType: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Quantity</Label>
                                <Input
                                    type="number"
                                    placeholder="0"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.quantity || ""}
                                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Agreed Price (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.agreedPricePerUnit || ""}
                                    onChange={(e) => setForm({ ...form, agreedPricePerUnit: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Total Debt (Calculated)</Label>
                                <div className="h-12 flex items-center px-4 bg-blue-500/5 text-blue-400 font-black text-xl rounded-lg border border-blue-500/10">
                                    ₦ {totalAmountOwed.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Notes / Terms</Label>
                            <textarea
                                className="w-full bg-[#0a0f1d] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-blue-500/20 outline-none font-medium min-h-[100px]"
                                placeholder="Payment terms or other details..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-600 hover:bg-blue-500 text-white w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-blue-500/10 border-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Record Credit Supply"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
