"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import {
    Loader2, Search, Filter, CalendarDays, User, ArrowUpDown,
    ShoppingCart, Briefcase, Receipt, PackageOpen, HandCoins, Landmark,
    Edit2, Trash2, X, Save, AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    rawDoc: any;
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

    // Edit/Delete State
    const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
    const [editFormData, setEditFormData] = useState<any>({});
    const [saving, setSaving] = useState(false);

    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deletingType, setDeletingType] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleEditClick = (entry: Entry) => {
        setEditingEntry(entry);
        setEditFormData({
            ...entry.rawDoc,
            date: new Date(entry.rawDoc.date).toISOString().split('T')[0] // Format for input type="date"
        });
    };

    const handleEditSave = async () => {
        if (!editingEntry) return;
        setSaving(true);
        try {
            const res = await fetch(`/api/owner/entries/${editingEntry.id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ ...editFormData, type: editingEntry.type })
            });
            if (res.ok) {
                setEditingEntry(null);
                fetchEntries(); // Refresh list to get updated totals, editedAt, etc.
            } else {
                alert("Failed to update entry.");
            }
        } catch (error) {
            console.error("Error updating entry", error);
        } finally {
            setSaving(false);
        }
    };

    const confirmDelete = async () => {
        if (!deletingId || !deletingType) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/owner/entries/${deletingId}?type=${deletingType}`, {
                method: "DELETE"
            });
            if (res.ok) {
                setDeletingId(null);
                setDeletingType(null);
                fetchEntries(); // Refresh the list
            } else {
                alert("Failed to delete entry.");
            }
        } catch (error) {
            console.error("Error deleting entry", error);
        } finally {
            setIsDeleting(false);
        }
    };

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
                                <th className="px-6 py-4 text-right">Actions</th>
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
                                                    <p className="font-bold text-white text-sm">{entry.date ? format(new Date(entry.date), "MMM do, yyyy") : "Unknown"}</p>
                                                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">{entry.date ? format(new Date(entry.date), "EEEE") : ""}</p>
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
                                                        {entry.submittedAt ? format(new Date(entry.submittedAt), "HH:mm") : "--:--"}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleEditClick(entry)}
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                                                >
                                                    <Edit2 size={14} />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => {
                                                        setDeletingId(entry.id);
                                                        setDeletingType(entry.type);
                                                    }}
                                                    className="w-8 h-8 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Slide-out Edit Panel */}
            {editingEntry && (
                <>
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity" onClick={() => setEditingEntry(null)} />
                    <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[450px] bg-[#0a0f1d] border-l border-white/5 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">

                        {/* Panel Header */}
                        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#0f1525]">
                            <div className="flex items-center gap-3">
                                <div className={`p-2 rounded-xl border ${typeConfig[editingEntry.type].bg} ${typeConfig[editingEntry.type].border} ${typeConfig[editingEntry.type].color}`}>
                                    {(() => { const Icon = typeConfig[editingEntry.type].icon; return <Icon size={20} />; })()}
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-white">Edit {typeConfig[editingEntry.type].label}</h2>
                                    <p className="text-xs text-slate-500">ID: <span className="font-mono">{editingEntry.id.substring(0, 8)}</span></p>
                                </div>
                            </div>
                            <button onClick={() => setEditingEntry(null)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Panel Body */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            {/* Read-only tracking data */}
                            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3">
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">Submitted By</span>
                                    <span className="text-slate-300 font-bold">{editingEntry.rawDoc.submittedBy}</span>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-slate-500 font-medium uppercase tracking-wider">Submitted At</span>
                                    <span className="text-slate-300 font-mono">{new Date(editingEntry.rawDoc.submittedAt).toLocaleString()}</span>
                                </div>
                                {editingEntry.rawDoc.editedAt && (
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-amber-500/70 font-medium uppercase tracking-wider">Last Edited</span>
                                        <span className="text-amber-500/90 font-mono">{new Date(editingEntry.rawDoc.editedAt).toLocaleString()}</span>
                                    </div>
                                )}
                            </div>

                            {/* Editable Form */}
                            <div className="space-y-4">

                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Date</Label>
                                    <Input
                                        type="date"
                                        value={editFormData.date || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, date: e.target.value })}
                                        className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 [&::-webkit-calendar-picker-indicator]:invert-[0.8]"
                                    />
                                </div>

                                {["SALE", "PURCHASE", "CREDIT_SUPPLY"].includes(editingEntry.type) && (
                                    <>
                                        <div className="space-y-2">
                                            <Label className="uppercase text-[10px] tracking-widest text-slate-400">Product Name</Label>
                                            <select
                                                value={editFormData.product || ""}
                                                onChange={(e) => setEditFormData({ ...editFormData, product: e.target.value })}
                                                className="w-full h-12 px-3 rounded-md border border-white/10 bg-black/20 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50 appearance-none"
                                            >
                                                <option value="BAG_OF_PURE_WATER" className="bg-[#0f1525]">Bag of Pure Water</option>
                                                <option value="RUBBER_OF_BOTTLE_WATER" className="bg-[#0f1525]">Rubber of Bottle Water</option>
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="uppercase text-[10px] tracking-widest text-slate-400">Quantity</Label>
                                                <Input
                                                    type="number"
                                                    min="1"
                                                    value={editFormData.quantity || ""}
                                                    onChange={(e) => setEditFormData({ ...editFormData, quantity: Number(e.target.value) })}
                                                    className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                                />
                                            </div>
                                            {editingEntry.type === "SALE" && (
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Price Per Unit (₦)</Label>
                                                    <Input
                                                        type="number"
                                                        value={editFormData.sellingPricePerUnit || ""}
                                                        onChange={(e) => setEditFormData({ ...editFormData, sellingPricePerUnit: Number(e.target.value) })}
                                                        className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                                    />
                                                </div>
                                            )}
                                            {editingEntry.type === "PURCHASE" && (
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Cost Per Unit (₦)</Label>
                                                    <Input
                                                        type="number"
                                                        value={editFormData.purchasePricePerUnit || ""}
                                                        onChange={(e) => setEditFormData({ ...editFormData, purchasePricePerUnit: Number(e.target.value) })}
                                                        className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                                    />
                                                </div>
                                            )}
                                            {editingEntry.type === "CREDIT_SUPPLY" && (
                                                <div className="space-y-2">
                                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Agreed Price (₦)</Label>
                                                    <Input
                                                        type="number"
                                                        value={editFormData.agreedPricePerUnit || ""}
                                                        onChange={(e) => setEditFormData({ ...editFormData, agreedPricePerUnit: Number(e.target.value) })}
                                                        className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </>
                                )}

                                {["CREDIT_SUPPLY", "COLLECTION"].includes(editingEntry.type) && (
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Customer Name</Label>
                                        <Input
                                            value={editFormData.customerName || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, customerName: e.target.value })}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                        />
                                    </div>
                                )}

                                {editingEntry.type === "EXPENSE" && (
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Description</Label>
                                        <Input
                                            value={editFormData.description || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, description: e.target.value })}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                        />
                                    </div>
                                )}

                                {["EXPENSE", "COLLECTION", "LODGMENT"].includes(editingEntry.type) && (
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Amount (₦)</Label>
                                        <Input
                                            type="number"
                                            value={editFormData.amount || editFormData.amountCollected || ""}
                                            onChange={(e) => setEditFormData((prev: any) => ({
                                                ...prev,
                                                ...(editingEntry?.type === "COLLECTION" ? { amountCollected: Number(e.target.value) } : { amount: Number(e.target.value) })
                                            }))}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50 font-mono"
                                        />
                                    </div>
                                )}

                                {editingEntry.type === "PURCHASE" && (
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Supplier Name</Label>
                                        <Input
                                            value={editFormData.supplierName || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, supplierName: e.target.value })}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                        />
                                    </div>
                                )}

                                {editingEntry.type === "LODGMENT" && (
                                    <div className="space-y-2">
                                        <Label className="uppercase text-[10px] tracking-widest text-slate-400">Bank Name</Label>
                                        <Input
                                            value={editFormData.bankName || ""}
                                            onChange={(e) => setEditFormData({ ...editFormData, bankName: e.target.value })}
                                            className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                        />
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="uppercase text-[10px] tracking-widest text-slate-400">Notes (Optional)</Label>
                                    <Input
                                        value={editFormData.notes || ""}
                                        onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                                        className="h-12 bg-black/20 border-white/10 text-white focus-visible:ring-emerald-500/50"
                                        placeholder="Add context to this entry..."
                                    />
                                </div>
                            </div>

                        </div>

                        {/* Panel Footer */}
                        <div className="p-6 border-t border-white/5 bg-[#0f1525]">
                            <Button
                                onClick={handleEditSave}
                                disabled={saving}
                                className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
                            >
                                {saving ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : <><Save size={18} className="mr-2" /> Save Changes & Record to Audit Log</>}
                            </Button>
                        </div>
                    </div>
                </>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && deletingType && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-[#0f1525] border border-rose-500/20 shadow-[0_0_40px_rgba(244,63,94,0.15)] rounded-3xl p-8 max-w-sm w-full animate-in zoom-in-95 duration-200">
                        <div className="w-16 h-16 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
                            <AlertCircle className="w-8 h-8 text-rose-500" />
                        </div>
                        <h3 className="text-xl font-black text-white text-center mb-2">Delete this record?</h3>
                        <p className="text-sm text-slate-400 text-center mb-8">
                            This action cannot be completely undone. It will be soft-deleted, removed from all financial totals, and recorded in the permanent audit log.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-12 border-white/10 bg-transparent text-slate-300 hover:bg-white/5 hover:text-white"
                                onClick={() => { setDeletingId(null); setDeletingType(null); }}
                                disabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                className="flex-1 h-12 bg-rose-500 hover:bg-rose-600 text-white font-bold shadow-[0_0_15px_rgba(244,63,94,0.3)]"
                                onClick={confirmDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : "Yes, Delete Record"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
