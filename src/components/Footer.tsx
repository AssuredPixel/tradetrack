"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
    return (
        <footer className="border-t border-white/10 bg-black/50 py-12 backdrop-blur-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
                    <div className="col-span-1 md:col-span-2">
                        <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-lg bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" />
                            <span className="text-lg font-bold tracking-tight text-white">TradeTrack</span>
                        </div>
                        <p className="mt-4 max-w-xs text-sm text-zinc-400">
                            The platform for modern businesses to manage trade, inventory, and personnel with ease and security.
                        </p>
                        <div className="mt-6 flex gap-4">
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                                <Github className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                                <Twitter className="h-5 w-5" />
                            </Link>
                            <Link href="#" className="text-zinc-400 hover:text-white transition-colors">
                                <Linkedin className="h-5 w-5" />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">Product</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Documentation</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">API Reference</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-white">Company</h3>
                        <ul className="mt-4 space-y-2">
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">About Us</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Careers</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                            <li><Link href="#" className="text-sm text-zinc-400 hover:text-white transition-colors">Terms of Service</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 border-t border-white/5 pt-8 text-center">
                    <p className="text-xs text-zinc-500">
                        &copy; {new Date().getFullYear()} TradeTrack. All rights reserved. Built with passion for modern trade.
                    </p>
                </div>
            </div>
        </footer>
    );
}
