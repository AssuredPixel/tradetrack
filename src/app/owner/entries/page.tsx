"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Loader2, Search, Filter, CalendarDays, User, ArrowUpDown,
    ShoppingCart, Briefcase, Receipt, PackageOpen, HandCoins, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface Entry {
    id: string;
    type: "SALE" | "CREDIT_SUPPLY" | "EXPENSE" | "PURCHASE" | "COLLECTION" | "LODGMENT";
    date: string;
    submittedBy: string;
    submittedAt: string;
    amount: number;
    product?: string;
    quantity?: number;
    details?: string;
    notes?: string;
}

const typeConfig = {
    SALE: { label: "Sale", icon: ShoppingCart, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    CREDIT_SUPPLY: { label: "Credit Supply", icon: Briefcase, color: "text-amber-500", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    EXPENSE: { label: "Expense", icon: Receipt, color: "text-rose-500", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    PURCHASE: { label: "Purchase", icon: PackageOpen, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20" },
    COLLECTION: { label: "Collection", icon: HandCoins, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "border-emerald-400/20" },
    LODGMENT: { label: "Lodgment", icon: Landmark, color: "text-indigo-500", bg: "bg-indigo-500/10", border: "border-indigo-500/20" }
};

export default function OwnerEntriesPage() {
    const [loading, setLoading] = useState(true);
    const [entries, setEntries] = useState<Entry[]>([]);
    const [users, setUsers] = useState<string[]>([]);

    // Filters
    const [typeFilter, setTypeFilter] = useState("ALL");
    const [userFilter, setUserFilter] = useState("ALL");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    const fetchEntries = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (typeFilter !== "ALL") params.append("type", typeFilter);
            if (userFilter !== "ALL") params.append("user", userFilter);
            if (startDate) params.append("start", startDate);
            if (endDate) params.append("end", endDate);

            const res = await fetch(`/api/owner/entries?${params.toString()}`);
            if (res.ok) {
                const data = await res.json();
                setEntries(data.entries);
                if (users.length === 0 && data.users) {
                    setUsers(data.users);
                }
            }
        } catch (error) {
            console.error("Failed to fetch entries", error);
        } finally {
            setLoading(false);
        }
    };

    // Refetch when filters change (except search which is client-side)
    useEffect(() => {
        fetchEntries();
    }, [typeFilter, userFilter, startDate, endDate]);

    const formatCurrency = (amount: number) => `₦${(amount || 0).toLocaleString()}`;

    // Client-side search filtering
    const filteredEntries = entries.filter(entry => {
        if (!searchQuery) return true;
        const query = searchQuery.toLowerCase();
        return (
            entry.details?.toLowerCase().includes(query) ||
            entry.product?.toLowerCase().includes(query) ||
            entry.notes?.toLowerCase().includes(query) ||
            formatCurrency(entry.amount).includes(query)
        );
    });

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 pb-12">

            {/* Header */}
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-8 border-b border-white/5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 shadow-[0_0_15px_rgba(100,116,139,0.2)]">
                        <ArrowUpDown className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-white mb-1">
                            Entry <span className="text-slate-400">Management</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium">Global ledger of all system transactions</p>
                    </div>
                </div>
            </header>

            {/* Filters Bar */}
            <div className="glass-panel p-4 rounded-xl border border-white/5 flex flex-wrap gap-4 items-center justify-between">

                {/* Search */}
                <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                    <Input
                        placeholder="Search amounts, names, products..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 h-10 bg-black/20 border-white/10 text-white placeholder:text-slate-500 focus-visible:ring-emerald-500/50"
                    />
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {/* Record Type Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 border-white/10 bg-black/20 text-slate-300 hover:text-white gap-2">
                                <Filter size={16} className="text-emerald-500" />
                                {typeFilter === "ALL" ? "All Types" : typeConfig[typeFilter as keyof typeof typeConfig].label}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-[#0f1525] border-white/10 p-2 shadow-2xl">
                            <div className="space-y-1">
                                <button
                                    onClick={() => setTypeFilter("ALL")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${typeFilter === "ALL" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                                >
                                    All Types
                                </button>
                                {Object.entries(typeConfig).map(([key, config]) => (
                                    <button
                                        key={key}
                                        onClick={() => setTypeFilter(key)}
                                        className={`w-full text-left px-3 py-2 rounded-md justify-start flex items-center gap-2 text-sm font-medium transition-colors ${typeFilter === key ? `${config.bg} ${config.color}` : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        <config.icon size={14} />
                                        {config.label}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* User Filter */}
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="h-10 border-white/10 bg-black/20 text-slate-300 hover:text-white gap-2">
                                <User size={16} className="text-emerald-500" />
                                {userFilter === "ALL" ? "All Users" : userFilter}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-48 bg-[#0f1525] border-white/10 p-2 shadow-2xl">
                            <div className="space-y-1">
                                <button
                                    onClick={() => setUserFilter("ALL")}
                                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${userFilter === "ALL" ? "bg-emerald-500/20 text-emerald-400" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                                >
                                    All Users
                                </button>
                                {users.map(user => (
                                    <button
                                        key={user}
                                        onClick={() => setUserFilter(user)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${userFilter === user ? "bg-emerald-500/20 text-emerald-400" : "text-slate-300 hover:bg-white/5 hover:text-white"}`}
                                    >
                                        {user}
                                    </button>
                                ))}
                            </div>
                        </PopoverContent>
                    </Popover>

                    {/* Date Range Filters */}
                    <div className="flex items-center gap-2">
                        <Input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            max={endDate || undefined}
                            className="w-auto h-10 bg-black/20 border-white/10 text-slate-300 text-sm [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                        />
                        <span className="text-slate-500">—</span>
                        <Input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate || undefined}
                            className="w-auto h-10 bg-black/20 border-white/10 text-slate-300 text-sm [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                        />
                    </div>

                    {(typeFilter !== "ALL" || userFilter !== "ALL" || startDate || endDate) && (
                        <Button
                            variant="ghost"
                            onClick={() => {
                                setTypeFilter("ALL");
                                setUserFilter("ALL");
                                setStartDate("");
                                setEndDate("");
                            }}
                            className="text-xs font-bold uppercase tracking-widest text-slate-500 hover:text-rose-400"
                        >
                            Reset
                        </Button>
                    )}
                </div>
            </div>

            {/* Table Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-4">
                    <Loader2 className="animate-spin w-10 h-10 text-emerald-500" />
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-sm">Querying Global Ledger...</p>
                </div>
            ) : filteredEntries.length === 0 ? (
                <div className="p-16 rounded-2xl border border-dashed border-white/10 text-center bg-white/[0.02]">
                    <ArrowUpDown className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-300 font-bold text-lg">No entries found matching criteria</p>
                    <p className="text-slate-500 text-sm mt-1">Try adjusting your filters or search terms.</p>
                </div>
            ) : (
                <div className="overflow-x-auto rounded-2xl border border-white/5 bg-[#0a0f1d] scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-[#0f1525] border-b border-white/10 text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                            <tr>
                                <th className="px-6 py-4">Transaction Date</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Context / Details</th>
                                <th className="px-6 py-4 text-right">Amount</th>
                                <th className="px-6 py-4">Submitted By</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {filteredEntries.map((entry) => {
                                const config = typeConfig[entry.type];
                                const Icon = config.icon;
                                const isDeduction = entry.type === "EXPENSE" || entry.type === "PURCHASE";

                                return (
                                    <tr key={entry.id} className="group hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <CalendarDays size={16} className="text-slate-600" />
                                                <div>
                                                    <p className="font-bold text-white text-sm">{format(new Date(entry.date), "MMM do, yyyy")}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{format(new Date(entry.date), "EEEE")}</p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className={`p-1.5 rounded-lg border ${config.bg} ${config.border} ${config.color}`}>
                                                    <Icon size={14} />
                                                </div>
                                                <span className={`text-[10px] font-bold uppercase tracking-widest ${config.color}`}>
                                                    {config.label}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 max-w-xs">
                                            {entry.product && (
                                                <p className="font-bold text-slate-200 text-sm truncate">
                                                    {entry.quantity ? `${entry.quantity} x ` : ''}{entry.product.replace('_', ' ')}
                                                </p>
                                            )}
                                            {entry.details && (
                                                <p className={`text-sm ${entry.product ? 'text-slate-400 mt-0.5' : 'font-bold text-slate-200'}`}>
                                                    {entry.details}
                                                </p>
                                            )}
                                            {entry.notes && (
                                                <p className="text-[10px] text-slate-500 mt-1 italic truncate">
                                                    "{entry.notes}"
                                                </p>
                                            )}
                                            {(!entry.product && !entry.details && !entry.notes) && (
                                                <span className="text-slate-600 text-xs italic">No context provided</span>
                                            )}
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <p className={`font-black tracking-tight ${isDeduction ? 'text-white' : 'text-emerald-400'}`}>
                                                {isDeduction ? '-' : '+'}{formatCurrency(entry.amount)}
                                            </p>
                                        </td>

                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                                                    <User size={12} className="text-emerald-500" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-emerald-500">{entry.submittedBy}</p>
                                                    <p className="text-[9px] font-mono text-slate-500 mt-0.5">
                                                        {format(new Date(entry.submittedAt), "HH:mm")}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
