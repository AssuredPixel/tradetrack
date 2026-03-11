"use client";

import { Search, Filter, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const typeConfig = {
    SALE: { label: "Sale" },
    CREDIT_SUPPLY: { label: "Credit Supply" },
    EXPENSE: { label: "Expense" },
    PURCHASE: { label: "Purchase" },
    COLLECTION: { label: "Collection" },
    LODGMENT: { label: "Lodgment" }
};

interface EntryFiltersProps {
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    typeFilter: string;
    setTypeFilter: (val: string) => void;
    userFilter: string;
    setUserFilter: (val: string) => void;
    startDate: string;
    setStartDate: (val: string) => void;
    endDate: string;
    setEndDate: (val: string) => void;
    users: string[];
}

export function EntryFilters({
    searchQuery, setSearchQuery,
    typeFilter, setTypeFilter,
    userFilter, setUserFilter,
    startDate, setStartDate,
    endDate, setEndDate,
    users
}: EntryFiltersProps) {
    const hasActiveFilters = typeFilter !== "ALL" || userFilter !== "ALL" || startDate || endDate;

    return (
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
                <div className="relative">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="h-10 pl-9 pr-8 rounded-md border border-white/10 bg-black/20 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        <option value="ALL" className="bg-[#0f1525] text-white">All Types</option>
                        {Object.entries(typeConfig).map(([key, config]) => (
                            <option key={key} value={key} className="bg-[#0f1525] text-white">
                                {config.label}
                            </option>
                        ))}
                    </select>
                </div>

                {/* User Filter */}
                <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-emerald-500 pointer-events-none" />
                    <select
                        value={userFilter}
                        onChange={(e) => setUserFilter(e.target.value)}
                        className="h-10 pl-9 pr-8 rounded-md border border-white/10 bg-black/20 text-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none cursor-pointer hover:bg-white/5 transition-colors"
                    >
                        <option value="ALL" className="bg-[#0f1525] text-white">All Users</option>
                        {users.map((u) => (
                            <option key={u} value={u} className="bg-[#0f1525] text-white">
                                {u}
                            </option>
                        ))}
                    </select>
                </div>

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

                {hasActiveFilters && (
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
    );
}
