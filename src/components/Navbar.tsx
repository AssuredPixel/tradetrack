"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export function Navbar() {
    return (
        <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/50 backdrop-blur-xl">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.4)]" />
                    <span className="text-xl font-bold tracking-tight text-white">TradeTrack</span>
                </div>

                <div className="hidden md:block">
                    <div className="flex items-center gap-8">
                        <Link href="#features" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                            Features
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                            Pricing
                        </Link>
                        <Link href="#about" className="text-sm font-medium text-zinc-400 transition-colors hover:text-white">
                            About
                        </Link>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Link href="/login">
                        <Button variant="ghost" className="text-zinc-400 hover:text-white hover:bg-white/5">
                            Sign In
                        </Button>
                    </Link>
                    {/*
                    <Button className="bg-emerald-600 text-white hover:bg-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                        Get Started
                    </Button>
                    */}
                </div>
            </div>
        </nav>
    );
}
