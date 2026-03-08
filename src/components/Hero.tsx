"use client";

import { Button } from "@/components/ui/button";
import { ArrowRight, BarChart3, Shield, Globe } from "lucide-react";

export function Hero() {
    return (
        <div className="relative overflow-hidden pt-32 pb-16 sm:pt-48 sm:pb-24">
            {/* Background decoration */}
            <div className="absolute top-0 left-1/2 -z-10 h-full w-full -translate-x-1/2 overflow-hidden blur-3xl opacity-20">
                <div className="absolute top-0 right-1/4 h-[500px] w-[500px] rounded-full bg-emerald-500/30" />
                <div className="absolute bottom-0 left-1/4 h-[300px] w-[300px] rounded-full bg-slate-500/20" />
            </div>

            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-emerald-400 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        New features updated
                    </div>

                    <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
                        Track your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">trade</span> faster than ever.
                    </h1>

                    <p className="mx-auto mt-6 max-w-2xl text-lg text-zinc-400 sm:text-xl">
                        The all-in-one platform for modern businesses to manage inventory, sales, and personnel with enterprise-grade security and real-time insights.
                    </p>

                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button size="lg" className="h-12 px-8 bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                            Get Started for Free
                            <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                        <Button size="lg" variant="outline" className="h-12 px-8 border-white/10 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
                            View Demo
                        </Button>
                    </div>

                    <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-4 lg:mt-24">
                        {[
                            { label: "10k+", value: "Active Users" },
                            { label: "$2B+", value: "Trade Volume" },
                            { label: "99.9%", value: "Uptime" },
                            { label: "24/7", value: "Support" },
                        ].map((stat, i) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                                <span className="text-2xl font-bold text-white sm:text-3xl">{stat.label}</span>
                                <span className="text-sm text-zinc-500">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
