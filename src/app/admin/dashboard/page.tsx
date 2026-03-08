"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Calendar,
    ShoppingCart,
    HandCoins,
    Banknote,
    PlusCircle,
    ArrowRight,
    TrendingUp,
    ShieldCheck
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface AdminStats {
    totalPurchased: number;
    totalCollected: number;
    totalLodged: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<AdminStats>({
        totalPurchased: 0,
        totalCollected: 0,
        totalLodged: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch("/api/admin/stats/today");
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch admin stats", error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    const todayDate = format(new Date(), "EEEE, do MMMM yyyy");

    return (
        <div className="max-w-7xl mx-auto space-y-12 pb-16">
            {/* Header / Date */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-emerald-500 font-bold tracking-widest uppercase text-xs">
                    <ShieldCheck size={14} />
                    <span>Administrative Control</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {todayDate}
                </h1>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="glass-panel border-white/5 bg-amber-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500 group-hover:scale-110 transition-transform">
                                <ShoppingCart size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-amber-500/10 text-amber-500 px-2 py-1 rounded">PURCHASES</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Stock Purchased</p>
                        <h3 className="text-3xl font-black text-white">
                            ₦{loading ? "---" : stats.totalPurchased.toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 bg-blue-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-500 group-hover:scale-110 transition-transform">
                                <HandCoins size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-500 px-2 py-1 rounded">COLLECTIONS</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Credit Collected</p>
                        <h3 className="text-3xl font-black text-white">
                            ₦{loading ? "---" : stats.totalCollected.toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>

                <Card className="glass-panel border-white/5 bg-emerald-500/5 overflow-hidden group">
                    <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 group-hover:scale-110 transition-transform">
                                <Banknote size={24} />
                            </div>
                            <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded">LODGMENTS</span>
                        </div>
                        <p className="text-slate-500 text-sm font-bold uppercase tracking-wider mb-1">Bank Lodgment</p>
                        <h3 className="text-3xl font-black text-white">
                            ₦{loading ? "---" : stats.totalLodged.toLocaleString()}
                        </h3>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Link href="/admin/log-purchase" className="group">
                    <div className="relative overflow-hidden h-32 rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-between transition-all hover:bg-white/10 hover:border-amber-500/50">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-amber-500 uppercase tracking-widest">Inventory</p>
                            <h4 className="text-xl font-black text-white uppercase italic">Log a Purchase</h4>
                        </div>
                        <div className="bg-amber-500 text-black p-3 rounded-xl shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                    </div>
                </Link>

                <Link href="/admin/log-collection" className="group">
                    <div className="relative overflow-hidden h-32 rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-between transition-all hover:bg-white/10 hover:border-blue-500/50">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-blue-400 uppercase tracking-widest">Revenue</p>
                            <h4 className="text-xl font-black text-white uppercase italic">Log a Collection</h4>
                        </div>
                        <div className="bg-blue-500 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                    </div>
                </Link>

                <Link href="/admin/log-lodgment" className="group">
                    <div className="relative overflow-hidden h-32 rounded-2xl bg-white/5 border border-white/10 p-6 flex items-center justify-between transition-all hover:bg-white/10 hover:border-emerald-500/50">
                        <div className="space-y-1">
                            <p className="text-xs font-black text-emerald-500 uppercase tracking-widest">Banking</p>
                            <h4 className="text-xl font-black text-white uppercase italic">Log a Lodgment</h4>
                        </div>
                        <div className="bg-emerald-500 text-black p-3 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-110 transition-transform">
                            <PlusCircle size={24} />
                        </div>
                    </div>
                </Link>
            </div>

            {/* Bottom Link */}
            <div className="flex justify-center pt-8">
                <Link
                    href="/admin/today"
                    className="flex items-center gap-3 text-slate-400 hover:text-white font-bold uppercase tracking-[0.2em] text-xs transition-all group"
                >
                    <span>View all administrative logs for today</span>
                    <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    );
}
