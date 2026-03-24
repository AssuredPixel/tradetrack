"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShoppingCart, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Product } from "@/lib/types";

export default function LogPurchasePage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        date: new Date().toISOString().split('T')[0],
        product: Product.FLOUR,
        unitType: "50kg",
        quantity: 1,
        purchasePricePerUnit: 0,
        supplierName: "",
        notes: "",
    });

    const totalCost = form.quantity * form.purchasePricePerUnit;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/admin/log-purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...form, totalCost }),
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => router.push("/admin/dashboard"), 2000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to log purchase");
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
                <div className="p-4 rounded-full bg-amber-500/20 text-amber-500 animate-bounce">
                    <CheckCircle2 size={64} />
                </div>
                <h2 className="text-3xl font-black text-white italic text-center">Stock Purchase Recorded!</h2>
                <p className="text-slate-400">Updating inventory and redirecting...</p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
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
                <CardHeader className="bg-amber-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                            <ShoppingCart size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Log New Purchase</CardTitle>
                            <CardDescription className="text-amber-500/80 font-bold tracking-wide italic">
                                NOTE: Record the purchase price you actually paid, not the selling price.
                            </CardDescription>
                        </div>
                    </div>
                </CardHeader>

                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-6 pt-8">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
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
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Supplier Name (Optional)</Label>
                                <Input
                                    placeholder="Enter company/supplier"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.supplierName}
                                    onChange={(e) => setForm({ ...form, supplierName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Product</Label>
                                <select
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none font-medium"
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
                                    className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-amber-500/20 outline-none appearance-none font-medium"
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
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.quantity || ""}
                                    onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Purchase Price/Unit (₦) - What we paid</Label>
                                <Input
                                    type="number"
                                    placeholder="0.00"
                                    className="input-brand outline-none border-none h-12 text-white"
                                    value={form.purchasePricePerUnit || ""}
                                    onChange={(e) => setForm({ ...form, purchasePricePerUnit: Number(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 flex flex-col gap-1">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-amber-500/60">Total Cost (Automated)</Label>
                            <span className="text-2xl font-black text-amber-500 tracking-tight leading-none group-hover:scale-105 transition-transform">
                                ₦ {totalCost.toLocaleString()}
                            </span>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Purchase Notes</Label>
                            <textarea
                                className="w-full bg-[#0a0f1d] border-none rounded-lg p-4 text-white focus:ring-2 focus:ring-amber-500/20 outline-none font-medium min-h-[100px]"
                                placeholder="Any context about this purchase..."
                                value={form.notes}
                                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                            />
                        </div>
                    </CardContent>

                    <CardFooter className="pb-8 pt-4">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="bg-amber-500 hover:bg-amber-400 text-black w-full h-14 text-sm font-black uppercase tracking-[0.2em] shadow-xl shadow-amber-500/10 border-none"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <Loader2 className="animate-spin w-5 h-5" />
                                    <span>Processing...</span>
                                </div>
                            ) : (
                                "RECORD PURCHASE"
                            )}
                        </Button>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
