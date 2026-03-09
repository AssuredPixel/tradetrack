"use client";

import Link from "next/link";
import { FileText, TrendingUp, ShoppingCart, TrendingDown, CreditCard, Landmark, LineChart, PackageOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ReportsNavigationPage() {
    const reports = [
        {
            title: "Sales Report",
            description: "Detailed breakdown of all revenue-generating transactions.",
            href: "/owner/reports/sales",
            icon: TrendingUp,
            color: "text-emerald-500",
            bg: "bg-emerald-500/10",
            border: "border-emerald-500/20",
            hover: "hover:border-emerald-500/50"
        },
        {
            title: "Purchases & Inventory",
            description: "History of stock acquisitions and cost calculations.",
            href: "/owner/reports/purchases",
            icon: PackageOpen,
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "border-blue-500/20",
            hover: "hover:border-blue-500/50"
        },
        {
            title: "Expenses Report",
            description: "Track all operational costs, overheads, and miscellaneous spending.",
            href: "/owner/reports/expenses",
            icon: TrendingDown,
            color: "text-rose-500",
            bg: "bg-rose-500/10",
            border: "border-rose-500/20",
            hover: "hover:border-rose-500/50"
        },
        {
            title: "Credit Ledger",
            description: "Monitor outstanding debts and credit recovery progress.",
            href: "/owner/reports/credit-ledger",
            icon: CreditCard,
            color: "text-amber-500",
            bg: "bg-amber-500/10",
            border: "border-amber-500/20",
            hover: "hover:border-amber-500/50"
        },
        {
            title: "Bank Lodgments",
            description: "Verifiable records of cash secured into company accounts.",
            href: "/owner/reports/lodgments",
            icon: Landmark,
            color: "text-indigo-500",
            bg: "bg-indigo-500/10",
            border: "border-indigo-500/20",
            hover: "hover:border-indigo-500/50"
        },
        {
            title: "Profit & Loss",
            description: "Comprehensive bottom-line performance over time.",
            href: "/owner/reports/profit-loss",
            icon: LineChart,
            color: "text-purple-500",
            bg: "bg-purple-500/10",
            border: "border-purple-500/20",
            hover: "hover:border-purple-500/50"
        }
    ];

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">
            <header className="flex flex-col gap-2 pb-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                        <FileText className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                            Financial <span className="text-blue-500">Reports</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Access detailed analytics and statements</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {reports.map((report) => {
                    const Icon = report.icon;
                    return (
                        <Link key={report.href} href={report.href} className="block group">
                            <Card className={`glass-panel border-white/5 ${report.hover} transition-all duration-300 h-full overflow-hidden relative`}>
                                {/* Background glow effect on hover */}
                                <div className={`absolute top-0 right-0 w-32 h-32 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${report.bg}`} />

                                <CardHeader className="relative z-10 pt-8">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-xl ${report.bg} ${report.border} border`}>
                                            <Icon className={`w-6 h-6 ${report.color}`} />
                                        </div>
                                    </div>
                                    <CardTitle className="text-xl font-bold text-white mb-2">{report.title}</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium leading-relaxed">
                                        {report.description}
                                    </CardDescription>
                                </CardHeader>
                            </Card>
                        </Link>
                    )
                })}
            </div>
        </div>
    );
}
