"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle2, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Product } from "@/lib/types";

export default function LogSalePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        customerName: "",
        product: Product.FLOUR,
        unitType: "50kg",
        quantity: 1,
        sellingPricePerUnit: 0,
        notes: "",
    });

    const totalAmount = form.unitType === "25kg" ? form.sellingPricePerUnit : form.quantity * form.sellingPricePerUnit;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/salesboy/log-sale", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, totalAmount }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/salesboy/dashboard"), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to log sale");
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
                <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-500 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-black text-white italic">Sale Recorded!</h2>
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
                <CardHeader className="bg-emerald-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Log New Sale</CardTitle>
                            <CardDescription className="text-slate-500 font-medium tracking-wide">Record a cash transaction</CardDescription>
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
                                    max={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Customer Name (Optional)</Label>
                                <Input
                                    placeholder="Enter customer name"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.customerName}
                                    onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Product</Label>
                                <select
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none font-medium"
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
                                <select
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none appearance-none font-medium"
                                    value={form.unitType}
                                    onChange={(e) => {
                                        const type = e.target.value;
                                        setForm({ 
                                            ...form, 
                                            unitType: type, 
                                            quantity: type === "25kg" ? 0.5 : (form.quantity === 0.5 ? 1 : form.quantity)
                                        });
                                    }}
                                    required
                                >
                                    <option value="50kg">50kg</option>
                                    <option value="25kg">25kg</option>
                                    <option value="50 liter oil">50 liter oil</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Quantity</Label>
                                <Input
                                    type="number"
                                    step="any"
                                    placeholder="0"
                                    className="input-brand outline-none border-none h-12 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={form.unitType === "25kg"}
                                    value={form.quantity || ""}
                                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Price per Unit (₦)</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.sellingPricePerUnit || ""}
                                    onChange={(e) => setForm({ ...form, sellingPricePerUnit: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Total Amount (Calculated)</Label>
                                <div className="h-12 flex items-center px-4 bg-emerald-500/5 text-emerald-500 font-black text-xl rounded-lg border border-emerald-500/10">
                                    ₦ {totalAmount.toLocaleString()}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Notes (Optional)</Label>
                            <textarea
                                className="w-full bg-[#0a0f1d] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium min-h-[100px]"
                                placeholder="Any additional details..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="btn-emerald w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 border-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "Record Transaction"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
