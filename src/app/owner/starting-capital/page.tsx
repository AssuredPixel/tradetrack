"use client";

import { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Briefcase, Info, Loader2, Save, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function DetailedStartingCapitalForm() {
    const searchParams = useSearchParams();
    const isRedirected = searchParams.get("redirected") === "true";

    // Core state
    const currentYear = new Date().getFullYear();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isLocked, setIsLocked] = useState(false);
    const [message, setMessage] = useState({ type: "", text: "" });

    // Form fields
    const [cashOnHand, setCashOnHand] = useState("");
    const [flourBags, setFlourBags] = useState("");
    const [flourPrice, setFlourPrice] = useState("");
    const [sugarBags, setSugarBags] = useState("");
    const [sugarPrice, setSugarPrice] = useState("");
    const [oilRubbers, setOilRubbers] = useState("");
    const [oilPrice, setOilPrice] = useState("");

    // Live Total Calculation
    const totalCapital = useMemo(() => {
        const cash = parseFloat(cashOnHand.replace(/,/g, '')) || 0;
        const flourTotal = (parseFloat(flourBags.replace(/,/g, '')) || 0) * (parseFloat(flourPrice.replace(/,/g, '')) || 0);
        const sugarTotal = (parseFloat(sugarBags.replace(/,/g, '')) || 0) * (parseFloat(sugarPrice.replace(/,/g, '')) || 0);
        const oilTotal = (parseFloat(oilRubbers.replace(/,/g, '')) || 0) * (parseFloat(oilPrice.replace(/,/g, '')) || 0);

        return cash + flourTotal + sugarTotal + oilTotal;
    }, [cashOnHand, flourBags, flourPrice, sugarBags, sugarPrice, oilRubbers, oilPrice]);

    useEffect(() => {
        fetchCurrentCapital();
    }, []);

    const fetchCurrentCapital = async () => {
        try {
            const res = await fetch(`/api/owner/starting-capital?year=${currentYear}`);
            const data = await res.json();

            if (data.capital) {
                // Pre-fill existing data
                setCashOnHand(data.capital.cashOnHand?.toString() || "0");
                setFlourBags(data.capital.flourBags?.toString() || "0");
                setFlourPrice(data.capital.flourPricePerBag?.toString() || "0");
                setSugarBags(data.capital.sugarBags?.toString() || "0");
                setSugarPrice(data.capital.sugarPricePerBag?.toString() || "0");
                setOilRubbers(data.capital.oilRubbers?.toString() || "0");
                setOilPrice(data.capital.oilPricePerRubber?.toString() || "0");

                if (data.capital.isLocked) {
                    setIsLocked(true);
                }
            }
        } catch (error) {
            console.error("Failed to fetch starting capital", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (isLocked) {
            setMessage({ type: "error", text: "This record is locked and can only be modified via formal Audit Log edits." });
            return;
        }

        setMessage({ type: "", text: "" });
        setSaving(true);

        const payload = {
            year: currentYear,
            cashOnHand: parseFloat(cashOnHand.replace(/,/g, '')) || 0,
            flourBags: parseFloat(flourBags.replace(/,/g, '')) || 0,
            flourPricePerBag: parseFloat(flourPrice.replace(/,/g, '')) || 0,
            sugarBags: parseFloat(sugarBags.replace(/,/g, '')) || 0,
            sugarPricePerBag: parseFloat(sugarPrice.replace(/,/g, '')) || 0,
            oilRubbers: parseFloat(oilRubbers.replace(/,/g, '')) || 0,
            oilPricePerRubber: parseFloat(oilPrice.replace(/,/g, '')) || 0,
            totalValue: totalCapital
        };

        if (payload.cashOnHand < 0) {
            setMessage({ type: "error", text: "Cash on Hand cannot be negative." });
            setSaving(false);
            return;
        }

        try {
            const res = await fetch("/api/owner/starting-capital", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                setMessage({ type: "success", text: `Starting capital for ${currentYear} successfully saved and locked!` });
                setIsLocked(true); // Lock it in the UI immediately
            } else {
                const errData = await res.json();
                setMessage({ type: "error", text: errData.error || "Failed to save capital." });
            }
        } catch (error) {
            setMessage({ type: "error", text: "A network error occurred." });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>;
    }

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20 mt-8">
            {isRedirected && !isLocked && (
                <div className="flex items-start gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
                    <Info className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                        <h4 className="font-bold tracking-tight">Financial Blueprint Required</h4>
                        <p className="font-medium text-sm">
                            Starting capital for this year ({currentYear}) has not been set yet. Set it now to unlock your dashboard.
                        </p>
                    </div>
                </div>
            )}

            {isLocked && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium">
                    <Lock className="h-5 w-5" />
                    <span>This {currentYear} record is locked to preserve financial integrity. Edits must be formally logged.</span>
                </div>
            )}

            <Card className="glass-panel border-emerald-500/20 overflow-hidden">
                <CardHeader className="bg-emerald-500/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 flex shrink-0 items-center justify-center">
                            <Briefcase size={24} />
                        </div>
                        <CardTitle className="text-2xl font-bold text-white tracking-tight leading-none">Starting Capital Blueprint</CardTitle>
                    </div>
                    <CardDescription className="text-slate-400 text-sm mt-2 max-w-2xl">
                        Declare your precise initial cash reserves and active inventory on hand to construct the financial baseline for {currentYear}.
                    </CardDescription>
                </CardHeader>

                <CardContent className="p-0">
                    <form onSubmit={handleSave}>
                        <div className="p-8 space-y-10">

                            {/* General & Cash */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        Fiscal Year
                                    </label>
                                    <Input
                                        type="text"
                                        value={currentYear}
                                        readOnly
                                        disabled
                                        className="h-14 bg-white/5 border-white/10 text-white font-bold text-xl cursor-not-allowed opacity-50"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                        Cash On Hand (₦)
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="0"
                                        value={cashOnHand}
                                        onChange={(e) => setCashOnHand(e.target.value)}
                                        readOnly={isLocked}
                                        disabled={isLocked}
                                        min="0"
                                        step="any"
                                        required
                                        className="h-14 bg-[#0a0f1d] border-white/10 text-white font-bold text-xl focus:border-emerald-500 focus:ring-emerald-500/20 disabled:opacity-50"
                                    />
                                </div>
                            </div>

                            <hr className="border-white/5" />

                            {/* Inventory Layout */}
                            <div className="space-y-8">
                                <h3 className="text-sm font-bold uppercase tracking-widest text-slate-300">Opening Inventory</h3>

                                {/* Flour Row */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                                    <div className="space-y-3 col-span-2 md:col-span-1">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset</label>
                                        <div className="h-12 flex items-center px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm">
                                            Bags of Flour
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Quantity <span className="text-slate-500 hidden sm:inline">(Bags)</span>
                                        </label>
                                        <Input
                                            type="number" placeholder="0" value={flourBags}
                                            onChange={(e) => setFlourBags(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                            Value <span className="text-slate-500 hidden sm:inline">(₦/Bag)</span>
                                        </label>
                                        <Input
                                            type="number" placeholder="0" value={flourPrice}
                                            onChange={(e) => setFlourPrice(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Sugar Row */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                                    <div className="space-y-3 col-span-2 md:col-span-1">
                                        <div className="h-12 flex items-center px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm">
                                            Bags of Sugar
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            type="number" placeholder="0" value={sugarBags}
                                            onChange={(e) => setSugarBags(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            type="number" placeholder="0" value={sugarPrice}
                                            onChange={(e) => setSugarPrice(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                </div>

                                {/* Oil Row */}
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-6 items-end">
                                    <div className="space-y-3 col-span-2 md:col-span-1">
                                        <div className="h-12 flex items-center px-4 rounded-xl bg-white/5 border border-white/10 text-slate-300 font-bold text-sm">
                                            Rubbers of Gr. Oil
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            type="number" placeholder="0" value={oilRubbers}
                                            onChange={(e) => setOilRubbers(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Input
                                            type="number" placeholder="0" value={oilPrice}
                                            onChange={(e) => setOilPrice(e.target.value)}
                                            readOnly={isLocked} disabled={isLocked} min="0" required
                                            className="h-12 bg-[#0a0f1d] border-white/10 text-white font-bold disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total & Submit Section */}
                        <div className="bg-white/5 p-8 border-t border-white/10 flex flex-col items-center space-y-8">

                            <div className="text-center space-y-2">
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500">
                                    Calculated Total Starting Capital
                                </p>
                                <h2 className="text-5xl md:text-6xl font-black text-emerald-500 tracking-tighter truncate max-w-full">
                                    ₦{totalCapital.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                </h2>
                            </div>

                            {message.text && (
                                <div className={`w-full p-4 rounded-xl text-sm font-bold text-center ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                                    {message.text}
                                </div>
                            )}

                            {!isLocked && (
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full max-w-md h-16 bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest text-sm transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)]"
                                >
                                    {saving ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                                    {saving ? "Locking Baseline..." : "Set Starting Capital"}
                                </Button>
                            )}
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}

export default function StartingCapitalPage() {
    return (
        <Suspense fallback={<div className="p-20 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
            <DetailedStartingCapitalForm />
        </Suspense>
    );
}
