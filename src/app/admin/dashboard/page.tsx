"use client";

import { ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
    return (
        <div className="max-w-7xl mx-auto">
            <header className="flex justify-between items-center pb-8 border-b border-white/5 mb-12">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                        <ShieldCheck className="w-6 h-6 text-emerald-500" />
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">
                        Admin <span className="text-emerald-500">Dashboard</span>
                    </h1>
                </div>
            </header>

            <main className="glass-panel p-12 rounded-2xl flex flex-col items-center justify-center text-center">
                <div className="w-16 h-1 w-emerald-500 rounded-full mb-6" />
                <h2 className="text-2xl font-semibold mb-4 text-white">Administrative Portal</h2>
                <p className="text-slate-400 max-w-md">
                    Full system overrides and User Management tools will be available in this secure section.
                </p>
            </main>
        </div>
    );
}
