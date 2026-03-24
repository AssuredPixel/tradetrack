"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    ShoppingCart,
    LogOut,
    ShieldCheck,
    Users,
    Settings,
    User,
    Menu,
    X,
    Banknote,
    CreditCard,
    HandCoins,
    FileText,
    History,
    User as UserIcon,
    Briefcase,
    Receipt,
    Sparkles,
    Package
} from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

import { Role } from "@/lib/types";

interface SidebarProps {
    role: Role;
}

const navLinks = {
    SALESBOY: [
        { name: "Dashboard", href: "/salesboy/dashboard", icon: LayoutDashboard },
        { name: "Log Sale", href: "/salesboy/log-sale", icon: ShoppingCart },
        { name: "Log Credit", href: "/salesboy/log-credit", icon: Briefcase },
        { name: "Log Expense", href: "/salesboy/log-expense", icon: Receipt },
        { name: "History", href: "/salesboy/today", icon: History },
    ],
    ADMIN: [
        { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
        { name: "Log Sale", href: "/admin/log-sale", icon: ShoppingCart },
        { name: "Log Purchase", href: "/admin/log-purchase", icon: Package },
        { name: "Log Collection", href: "/admin/log-collection", icon: HandCoins },
        { name: "Log Lodgment", href: "/admin/log-lodgment", icon: Banknote },
        { name: "Today's Entries", href: "/admin/today", icon: FileText },
        { name: "Audit Logs", href: "/admin/logs", icon: History },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ],
    OWNER: [
        { name: "Dashboard", href: "/owner/dashboard", icon: LayoutDashboard },
        { name: "AI Assistant", href: "/owner/ai-assistant", icon: Sparkles },
        { name: "Reports", href: "/owner/reports", icon: FileText },
        { name: "All Entries", href: "/owner/entries", icon: History },
        { name: "Starting Capital", href: "/owner/starting-capital", icon: Banknote },
        { name: "Manage Users", href: "/owner/users", icon: Users },
        { name: "Settings", href: "/owner/settings", icon: Settings },
    ],
};

const RoleIcons = {
    SALESBOY: UserIcon,
    ADMIN: ShieldCheck,
    OWNER: Briefcase
};

export default function AppLayoutShell({
    children,
    role
}: {
    children: React.ReactNode;
    role: Role
}) {
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const links = navLinks[role];
    const RoleIcon = RoleIcons[role];

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setIsSidebarOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-[#070b14] text-slate-200">
            {/* Mobile Sidebar Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed inset-y-0 left-0 w-64 bg-[#0a0f1d] border-r border-white/5 z-50 transition-transform duration-300 transform
                lg:translate-x-0 lg:static lg:inset-0
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            `}>
                <div className="flex flex-col h-full">
                    {/* Brand */}
                    <div className="p-6 border-b border-white/5 mb-6">
                        <Link href={`/${role.toLowerCase()}/dashboard`} className="flex items-center gap-3">
                            <div className="p-1.5 rounded-lg bg-emerald-500/5 border border-white/5">
                                <img src="/logo.png" alt="TradeTrack Logo" className="w-7 h-7 object-contain" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-white italic">
                                Trade<span className="text-emerald-500 not-italic">Track</span>
                            </span>
                        </Link>
                    </div>

                    {/* Nav Links */}
                    <nav className="flex-1 px-4 space-y-1">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname === link.href;

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`
                                        flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
                                        ${isActive
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                                    `}
                                >
                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-emerald-500' : 'group-hover:text-emerald-400'}`} />
                                    <span className="font-medium">{link.name}</span>
                                </Link>
                            );
                        })}
                    </nav>

                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Header */}
                <header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between px-6 bg-[#070b14]/80 backdrop-blur-xl sticky top-0 z-30">
                    <button
                        className="p-2 -ml-2 text-slate-400 hover:text-white lg:hidden"
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <Menu size={24} />
                    </button>

                    <div className="flex-1 px-4">
                        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
                            {pathname.split('/').pop()?.replace('-', ' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="hidden sm:flex flex-col items-end mr-2">
                            <span className="text-sm font-semibold text-white">Authorized Access</span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{role} Portal</span>
                        </div>

                        {/* Logout button - Visible on all screens, next to user icon */}
                        <button
                            onClick={() => signOut({ callbackUrl: "/login" })}
                            className="p-2 text-slate-400 hover:text-red-400 transition-colors flex items-center gap-2"
                            title="Sign Out"
                        >
                            <LogOut size={20} />
                            <span className="hidden md:inline text-xs font-semibold uppercase tracking-wider">Sign Out</span>
                        </button>

                        <div className="w-10 h-10 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-slate-400">
                            <UserIcon size={20} />
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 lg:p-10 relative">
                    {/* Background Gradients */}
                    <div className="absolute top-0 right-0 w-[50%] h-[50%] bg-emerald-500/5 blur-[120px] pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[50%] h-[50%] bg-slate-500/5 blur-[120px] pointer-events-none" />

                    <div className="relative z-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
